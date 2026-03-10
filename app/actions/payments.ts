'use server';
// app/actions/payments.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function markPaymentAsPaid(paymentId: string) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { lease: { include: { unit: { include: { property: true } } } } },
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.lease.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'paid', paid_date: new Date() },
  });
}
