// app/(portal)/portal/maintenance/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import MaintenanceClient from './MaintenanceClient';

export default async function PortalMaintenancePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  const tenant = user
    ? await prisma.tenant.findFirst({
        where: { email: user.email },
        include: {
          leases: {
            where: { status: 'active' },
            include: { unit: true },
            take: 1,
          },
          maintenance_requests: {
            include: { unit: { include: { property: true } } },
            orderBy: { status: 'asc' },
          },
        },
      })
    : null;

  const activeUnit = tenant?.leases[0]?.unit ?? null;

  return (
    <MaintenanceClient
      requests={tenant?.maintenance_requests ?? []}
      tenantId={tenant?.id ?? null}
      activeUnit={
        activeUnit
          ? { id: activeUnit.id, unit_number: activeUnit.unit_number }
          : null
      }
    />
  );
}
