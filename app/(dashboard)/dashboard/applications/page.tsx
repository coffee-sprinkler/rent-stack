// app/(dashboard)/dashboard/applications/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import ApplicationsClient from './ApplicationsClient';

export default async function ApplicationsPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const applications = await prisma.leaseApplication.findMany({
    where: { unit: { property: { organization_id: session.organizationId } } },
    include: {
      unit: { include: { property: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <ApplicationsClient
      applications={applications.map((a) => ({
        ...a,
        unit: { ...a.unit, rent_amount: Number(a.unit.rent_amount) },
      }))}
    />
  );
}
