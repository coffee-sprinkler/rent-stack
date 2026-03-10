// app/api/auth/resend-verification/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.email_verified)
    return NextResponse.json({ error: 'Already verified' }, { status: 400 });

  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verify_token: verifyToken, verify_token_exp: verifyTokenExp },
  });

  await sendVerificationEmail(user.email, user.name, verifyToken);

  return NextResponse.json({ success: true });
}
