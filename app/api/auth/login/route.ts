import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { verifyPassword, signToken } from '@/lib/auth';
import { setSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password)))
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );

    const token = signToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organization_id ?? undefined,
      name: user.name,
      email: user.email,
      isOrgAdmin: user.is_org_admin,
    });
    await setSession(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[LOGIN]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
