// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token)
    return NextResponse.redirect(
      new URL('/verify-email?error=invalid', req.url),
    );

  const user = await prisma.user.findFirst({
    where: { verify_token: token, verify_token_exp: { gt: new Date() } },
  });

  if (!user)
    return NextResponse.redirect(
      new URL('/verify-email?error=expired', req.url),
    );

  await prisma.user.update({
    where: { id: user.id },
    data: { email_verified: true, verify_token: null, verify_token_exp: null },
  });

  return NextResponse.redirect(new URL('/verify-email?success=true', req.url));
}
