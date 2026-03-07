// app/(dashboard)/dashboard/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import DashboardShell from './DashboardShell';

export default async function DashboardPage() {
  const session = await getSession();

  const [properties, units, tenants, payments] = await Promise.all([
    prisma.property.count({
      where: { organization_id: session!.organizationId },
    }),
    prisma.unit.findMany({
      where: { property: { organization_id: session!.organizationId } },
      select: { status: true },
    }),
    prisma.tenant.count({
      where: { organization_id: session!.organizationId },
    }),
    prisma.payment.findMany({
      where: {
        lease: {
          unit: { property: { organization_id: session!.organizationId } },
        },
        status: 'pending',
      },
      select: { amount: true },
    }),
  ]);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const pendingRent = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardShell
      userName={session!.name ?? ''}
      userRole={session!.role}
      stats={{
        properties,
        totalUnits,
        occupiedUnits,
        availableUnits,
        tenants,
        pendingRent,
      }}
    />
  );
}
