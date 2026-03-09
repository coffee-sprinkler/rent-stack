'use server';
// app/actions/applications.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function applyForUnit(unitId: string, message: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Check unit is still available
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit || unit.status !== 'available')
    throw new Error('Unit is not available');

  // Prevent duplicate pending application
  const existing = await prisma.leaseApplication.findFirst({
    where: { unit_id: unitId, user_id: session.userId, status: 'pending' },
  });
  if (existing)
    throw new Error('You already have a pending application for this unit');

  return prisma.leaseApplication.create({
    data: {
      unit_id: unitId,
      user_id: session.userId,
      message: message.trim() || null,
    },
  });
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

  // Find or create tenant record from user
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

  await prisma.$transaction([
    // Create lease
    prisma.lease.create({
      data: {
        unit_id: application.unit_id,
        tenant_id: tenant.id,
        start_date: today,
        end_date: endDate,
        monthly_rent: application.unit.rent_amount,
        deposit_amount: application.unit.rent_amount,
        status: 'active',
      },
    }),
    // Mark unit occupied
    prisma.unit.update({
      where: { id: application.unit_id },
      data: { status: 'occupied' },
    }),
    // Approve this application
    prisma.leaseApplication.update({
      where: { id: applicationId },
      data: { status: 'approved' },
    }),
    // Reject all other pending applications for same unit
    prisma.leaseApplication.updateMany({
      where: {
        unit_id: application.unit_id,
        status: 'pending',
        id: { not: applicationId },
      },
      data: { status: 'rejected' },
    }),
  ]);
}

export async function rejectApplication(applicationId: string) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const application = await prisma.leaseApplication.findUnique({
    where: { id: applicationId },
    include: { unit: { include: { property: true } } },
  });
  if (!application) throw new Error('Application not found');
  if (application.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  return prisma.leaseApplication.update({
    where: { id: applicationId },
    data: { status: 'rejected' },
  });
}
