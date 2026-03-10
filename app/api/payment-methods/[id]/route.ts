// app/api/payment-methods/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method || method.user_id !== session.userId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.paymentMethod.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
