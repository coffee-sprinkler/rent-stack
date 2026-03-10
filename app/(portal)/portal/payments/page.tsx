// app/(portal)/portal/payments/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import PortalPaymentsClient from './PortalPaymentsClient';

export default async function PortalPaymentsPage() {
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
            include: {
              payments: { orderBy: { due_date: 'desc' } },
              unit: {
                include: {
                  property: {
                    include: {
                      organization: {
                        include: {
                          users: {
                            where: { role: 'manager' },
                            include: { payment_methods: true },
                            take: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    : null;

  const payments =
    tenant?.leases.flatMap((l) => {
      const landlordMethods =
        l.unit.property.organization?.users[0]?.payment_methods ?? [];
      return l.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        due_date: p.due_date.toISOString(),
        paid_date: p.paid_date ? p.paid_date.toISOString() : null,
        unit: l.unit,
        payment_methods: landlordMethods,
      }));
    }) ?? [];

  return <PortalPaymentsClient payments={payments} />;
}
