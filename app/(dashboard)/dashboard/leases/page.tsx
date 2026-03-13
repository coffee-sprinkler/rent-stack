// app/(dashboard)/dashboard/leases/page.tsx

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import LeasesClient from './LeasesClient';

export default async function LeasesPage() {
  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const leases = await prisma.lease.findMany({
    where: {
      unit: { property: { organization_id: session.organizationId } },
    },
    include: {
      tenant: {
        select: { id: true, first_name: true, last_name: true, email: true },
      },
      unit: {
        select: {
          id: true,
          unit_number: true,
          property: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { start_date: 'desc' },
  });

  // Serialize Decimal fields before passing to client
  const serialized = leases.map((lease) => ({
    ...lease,
    monthly_rent: Number(lease.monthly_rent),
    deposit_amount: Number(lease.deposit_amount),
  }));

  return <LeasesClient leases={serialized} />;
}
