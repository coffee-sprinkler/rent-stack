// app/(dashboard)/dashboard/leases/[id]/page.tsx

import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import LeaseDetailClient from './LeaseDetailClient';

type Props = { params: Promise<{ id: string }> };

export default async function LeaseDetailPage(props: Props) {
  const { id } = await props.params;

  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      tenant: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
      },
      unit: {
        select: {
          id: true,
          unit_number: true,
          property: { select: { id: true, name: true, organization_id: true } },
        },
      },
      payments: {
        orderBy: { due_date: 'asc' },
        select: {
          id: true,
          amount: true,
          due_date: true,
          paid_date: true,
          status: true,
        },
      },
    },
  });

  if (!lease) notFound();
  if (lease.unit.property.organization_id !== session.organizationId) {
    redirect('/dashboard/unauthorized');
  }

  // Serialize Decimal fields before passing to client
  const serialized = {
    ...lease,
    monthly_rent: Number(lease.monthly_rent),
    deposit_amount: Number(lease.deposit_amount),
    payments: lease.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  };

  return <LeaseDetailClient lease={serialized} />;
}
