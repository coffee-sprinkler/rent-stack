// app/(dashboard)/dashboard/maintenance/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import MaintenanceClient from './MaintenanceClient';

export default async function MaintenancePage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const requests = await prisma.maintenanceRequest.findMany({
    where: { unit: { property: { organization_id: session.organizationId } } },
    include: {
      unit: { include: { property: true } },
      tenant: true,
    },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }],
  });

  return (
    <MaintenanceClient
      requests={requests.map((r) => ({
        ...r,
        created_at: r.created_at.toISOString(),
      }))}
    />
  );
}
