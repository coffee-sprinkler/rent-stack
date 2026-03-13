'use server';
// app/actions/leases.ts

import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// ─── terminateLease ───────────────────────────────────────────────────────────
// Wraps in a transaction: marks lease as terminated, stamps terminated_at,
// saves optional reason, and auto-sets the unit back to vacant.

export async function terminateLease(formData: FormData) {
  const session = await getSession();
  if (!session || session.role === 'tenant') throw new Error('Unauthorized');

  const leaseId = formData.get('leaseId') as string;
  const reason = (formData.get('reason') as string) ?? '';

  if (!leaseId) throw new Error('Lease ID is required');

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      unit_id: true,
      unit: { select: { property: { select: { organization_id: true } } } },
    },
  });

  if (!lease) throw new Error('Lease not found');
  if (lease.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  await prisma.$transaction([
    prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: 'terminated',
        terminated_at: new Date(),
        termination_reason: reason || null,
      },
    }),
    prisma.unit.update({
      where: { id: lease.unit_id },
      data: { status: 'available' },
    }),
  ]);

  revalidatePath('/dashboard/leases');
}

// ─── renewLease ───────────────────────────────────────────────────────────────
// Transaction steps:
// 1. Set old lease status to expired
// 2. Create new lease with new dates/rent, linked via renewed_from_id
// 3. Copy all pending payments from old lease to the new lease_id

export async function renewLease(formData: FormData) {
  const session = await getSession();
  if (!session || session.role === 'tenant') throw new Error('Unauthorized');

  const leaseId = formData.get('leaseId') as string;
  const newEndDate = formData.get('newEndDate') as string;
  const newRent = formData.get('newRent') as string;

  if (!leaseId || !newEndDate || !newRent)
    throw new Error('All fields are required');

  const oldLease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      tenant_id: true,
      unit_id: true,
      deposit_amount: true,
      end_date: true,
      status: true,
      unit: { select: { property: { select: { organization_id: true } } } },
      payments: {
        where: { status: 'pending' },
        select: { amount: true, due_date: true },
      },
    },
  });

  if (!oldLease) throw new Error('Lease not found');
  if (oldLease.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');
  if (oldLease.status !== 'active')
    throw new Error('Only active leases can be renewed');

  const newLease = await prisma.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id: leaseId },
      data: { status: 'expired' },
    });

    const created = await tx.lease.create({
      data: {
        tenant_id: oldLease.tenant_id,
        unit_id: oldLease.unit_id,
        start_date: oldLease.end_date,
        end_date: new Date(newEndDate),
        monthly_rent: Number(newRent),
        deposit_amount: Number(oldLease.deposit_amount),
        status: 'active',
        renewed_from_id: leaseId,
      },
    });

    if (oldLease.payments.length > 0) {
      await tx.payment.createMany({
        data: oldLease.payments.map((payment) => ({
          lease_id: created.id,
          amount: Number(payment.amount),
          due_date: payment.due_date,
          status: 'pending' as const,
        })),
      });
    }

    return created;
  });

  revalidatePath('/dashboard/leases');
  return newLease.id;
}

// ─── saveLeaseDocumentUrl ─────────────────────────────────────────────────────
// Called after the client uploads the PDF to Cloudinary.
// Saves the returned secure_url to the lease record.

export async function saveLeaseDocumentUrl(
  leaseId: string,
  documentUrl: string,
) {
  const session = await getSession();
  if (!session || session.role === 'tenant') throw new Error('Unauthorized');

  if (!leaseId || !documentUrl)
    throw new Error('Lease ID and document URL are required');

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      unit: { select: { property: { select: { organization_id: true } } } },
    },
  });

  if (!lease) throw new Error('Lease not found');
  if (lease.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  await prisma.lease.update({
    where: { id: leaseId },
    data: { document_url: documentUrl },
  });

  revalidatePath('/dashboard/leases');
}

// ─── editLease ────────────────────────────────────────────────────────────────
// Updates start_date, end_date, monthly_rent on an active lease.
// Payment reconciliation: add/remove pending payments outside existing ones.
// - Paid payments are never touched
// - Pending payments outside the new date range are deleted
// - Months in the new range with no existing payment are created

export async function editLease(formData: FormData) {
  const session = await getSession();
  if (!session || session.role === 'tenant') throw new Error('Unauthorized');

  const leaseId = formData.get('leaseId') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const monthlyRent = formData.get('monthlyRent') as string;

  if (!leaseId || !startDate || !endDate || !monthlyRent)
    throw new Error('All fields are required');

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      unit: { select: { property: { select: { organization_id: true } } } },
      payments: { select: { id: true, due_date: true, status: true } },
    },
  });

  if (!lease) throw new Error('Lease not found');
  if (lease.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  if (newEnd <= newStart) throw new Error('End date must be after start date');

  // Build expected monthly due_dates for the new range (1st of each month after start)
  function buildMonthlyDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const cursor = new Date(start);
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return dates;
  }

  const expectedDates = buildMonthlyDates(newStart, newEnd);
  const expectedKeys = new Set(
    expectedDates.map((d) => d.toISOString().slice(0, 7)),
  );

  // Pending payments outside new range → delete
  const toDelete = lease.payments
    .filter((p) => p.status === 'pending')
    .filter(
      (p) => !expectedKeys.has(new Date(p.due_date).toISOString().slice(0, 7)),
    )
    .map((p) => p.id);

  // Months in range with no existing payment record → create
  const existingKeys = new Set(
    lease.payments.map((p) => new Date(p.due_date).toISOString().slice(0, 7)),
  );
  const toCreate = expectedDates.filter(
    (d) => !existingKeys.has(d.toISOString().slice(0, 7)),
  );

  await prisma.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id: leaseId },
      data: {
        start_date: newStart,
        end_date: newEnd,
        monthly_rent: Number(monthlyRent),
      },
    });

    if (toDelete.length > 0) {
      await tx.payment.deleteMany({ where: { id: { in: toDelete } } });
    }

    if (toCreate.length > 0) {
      await tx.payment.createMany({
        data: toCreate.map((due_date) => ({
          lease_id: leaseId,
          amount: Number(monthlyRent),
          due_date,
          status: 'pending' as const,
        })),
      });
    }
  });

  revalidatePath('/dashboard/leases');
  revalidatePath(`/dashboard/leases/${leaseId}`);
}
