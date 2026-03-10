'use server';
// app/actions/applications.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
} from '@/lib/email';

export async function applyForUnit(unitId: string, message: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      property: {
        include: {
          organization: {
            include: { users: { where: { role: 'manager' }, take: 1 } },
          },
        },
      },
    },
  });
  if (!unit || unit.status !== 'available')
    throw new Error('Unit is not available');

  const existing = await prisma.leaseApplication.findFirst({
    where: { unit_id: unitId, user_id: session.userId, status: 'pending' },
  });
  if (existing)
    throw new Error('You already have a pending application for this unit');

  const applicant = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!applicant) throw new Error('User not found');

  const application = await prisma.leaseApplication.create({
    data: {
      unit_id: unitId,
      user_id: session.userId,
      message: message.trim() || null,
    },
  });

  // Notify landlord
  const landlord = unit.property.organization?.users[0];
  if (landlord) {
    await sendApplicationReceivedEmail(
      landlord.email,
      applicant.name,
      unit.unit_number,
      unit.property.name,
    ).catch(console.error);
  }

  return application;
}

export async function approveApplication(applicationId: string) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const application = await prisma.leaseApplication.findUnique({
    where: { id: applicationId },
    include: { unit: { include: { property: true } }, user: true },
  });
  if (!application) throw new Error('Application not found');
  if (application.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  let tenant = await prisma.tenant.findFirst({
    where: { email: application.user.email },
  });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        organization_id: session.organizationId,
        first_name: application.user.name.split(' ')[0],
        last_name: application.user.name.split(' ').slice(1).join(' ') || '-',
        email: application.user.email,
        phone: application.user.phone ?? null,
      },
    });
  }

  const today = new Date();
  const endDate = new Date(today);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const lease = await prisma.lease.create({
    data: {
      unit_id: application.unit_id,
      tenant_id: tenant.id,
      start_date: today,
      end_date: endDate,
      monthly_rent: application.unit.rent_amount,
      deposit_amount: application.unit.rent_amount,
      status: 'active',
    },
  });

  const payments: {
    lease_id: string;
    amount: number;
    due_date: Date;
    status: 'pending';
  }[] = [];
  const current = new Date(today);
  current.setDate(1);
  current.setMonth(current.getMonth() + 1);
  while (current <= endDate) {
    payments.push({
      lease_id: lease.id,
      amount: Number(application.unit.rent_amount),
      due_date: new Date(current),
      status: 'pending',
    });
    current.setMonth(current.getMonth() + 1);
  }
  await prisma.payment.createMany({ data: payments });

  await prisma.unit.update({
    where: { id: application.unit_id },
    data: { status: 'occupied' },
  });
  await prisma.leaseApplication.update({
    where: { id: applicationId },
    data: { status: 'approved' },
  });
  await prisma.leaseApplication.updateMany({
    where: {
      unit_id: application.unit_id,
      status: 'pending',
      id: { not: applicationId },
    },
    data: { status: 'rejected' },
  });

  // Notify tenant
  await sendApplicationStatusEmail(
    application.user.email,
    application.user.name,
    'approved',
    application.unit.unit_number,
    application.unit.property.name,
  ).catch(console.error);
}

export async function rejectApplication(applicationId: string) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const application = await prisma.leaseApplication.findUnique({
    where: { id: applicationId },
    include: { unit: { include: { property: true } }, user: true },
  });
  if (!application) throw new Error('Application not found');
  if (application.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  await prisma.leaseApplication.update({
    where: { id: applicationId },
    data: { status: 'rejected' },
  });

  // Notify tenant
  await sendApplicationStatusEmail(
    application.user.email,
    application.user.name,
    'rejected',
    application.unit.unit_number,
    application.unit.property.name,
  ).catch(console.error);
}
