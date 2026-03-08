// app/api/dashboard/properties/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session?.organizationId) return NextResponse.json([], { status: 401 });

  const properties = await prisma.property.findMany({
    where: { organization_id: session.organizationId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(properties);
}
