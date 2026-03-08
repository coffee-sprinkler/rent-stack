'use server';
// app/actions/expenses.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function createExpense(data: {
  property_id: string;
  category: string;
  amount: string;
  description: string;
  date: string;
}) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const property = await prisma.property.findFirst({
    where: { id: data.property_id, organization_id: session.organizationId },
  });
  if (!property) throw new Error('Property not found');

  return prisma.expense.create({
    data: {
      property_id: data.property_id,
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description.trim() || null,
      date: new Date(data.date),
    },
  });
}
