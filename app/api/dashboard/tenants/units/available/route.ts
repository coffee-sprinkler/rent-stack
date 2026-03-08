// app/api/dashboard/units/available/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session?.organizationId) return NextResponse.json([], { status: 401 });

  const units = await prisma.unit.findMany({
    where: {
      status: 'available',
      property: { organization_id: session.organizationId },
    },
    select: {
      id: true,
      unit_number: true,
      rent_amount: true,
      property: { select: { name: true } },
    },
    orderBy: { unit_number: 'asc' },
  });

  return NextResponse.json(
    units.map((u) => ({ ...u, rent_amount: u.rent_amount.toString() })),
  );
}
