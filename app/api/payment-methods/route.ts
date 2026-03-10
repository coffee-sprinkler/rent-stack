// app/api/payment-methods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { label, qr_code_url } = await req.json();
  if (!label || !qr_code_url)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const method = await prisma.paymentMethod.create({
    data: { user_id: session.userId, label, qr_code_url },
  });

  return NextResponse.json(method);
}
