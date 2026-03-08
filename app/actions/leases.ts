'use server';
// app/actions/leases.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function createLease(data: {
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  deposit_amount: string;
}) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  // Verify unit belongs to org
  const unit = await prisma.unit.findFirst({
    where: {
      id: data.unit_id,
      property: { organization_id: session.organizationId },
    },
  });
  if (!unit) throw new Error('Unit not found');

  // Verify tenant belongs to org
  const tenant = await prisma.tenant.findFirst({
    where: { id: data.tenant_id, organization_id: session.organizationId },
  });
  if (!tenant) throw new Error('Tenant not found');

  const lease = await prisma.lease.create({
    data: {
      tenant_id: data.tenant_id,
      unit_id: data.unit_id,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      monthly_rent: parseFloat(data.monthly_rent),
      deposit_amount: parseFloat(data.deposit_amount),
      status: 'active',
    },
  });

  // Mark unit as occupied
  await prisma.unit.update({
    where: { id: data.unit_id },
    data: { status: 'occupied' },
  });

  return lease;
}
