// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organizationName, role } = await req.json();

    if (!name || !email || !password || !role)
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );

    if (role === 'manager' && !organizationName)
      return NextResponse.json(
        { error: 'Organization name is required for landlords' },
        { status: 400 },
      );

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 },
      );

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    let user;

    if (role === 'manager') {
      const org = await prisma.organization.create({
        data: {
          name: organizationName,
          users: {
            create: {
              name,
              email,
              password: await hashPassword(password),
              role: 'manager',
              verify_token: verifyToken,
              verify_token_exp: verifyTokenExp,
            },
          },
        },
        include: { users: true },
      });
      user = org.users[0];
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
          role: 'tenant',
          verify_token: verifyToken,
          verify_token_exp: verifyTokenExp,
        },
      });
    }

    // Send verification email
    await sendVerificationEmail(email, name, verifyToken);

    const token = signToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organization_id ?? undefined,
      name: user.name,
    });
    await setSession(token);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[REGISTER]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
