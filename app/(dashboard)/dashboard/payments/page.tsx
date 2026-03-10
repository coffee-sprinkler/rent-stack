// app/(dashboard)/dashboard/payments/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: { property: { organization_id: session.organizationId } },
      },
    },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: { include: { property: true } },
        },
      },
    },
    orderBy: { due_date: 'desc' },
  });

  return (
    <PaymentsClient
      payments={payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        paid_date: p.paid_date ? p.paid_date.toISOString() : null,
        due_date: p.due_date.toISOString(),
      }))}
    />
  );
}
