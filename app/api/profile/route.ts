import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId: string;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    phone,
    avatar_url,
    pref_location,
    pref_min_budget,
    pref_max_budget,
    pref_bedrooms,
    pref_property_type,
  } = body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      avatar_url,
      pref_location,
      pref_min_budget,
      pref_max_budget,
      pref_bedrooms,
      pref_property_type,
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user);
}
