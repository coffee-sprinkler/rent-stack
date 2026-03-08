// app/api/dashboard/tenants/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session?.organizationId) return NextResponse.json([], { status: 401 });

  const tenants = await prisma.tenant.findMany({
    where: { organization_id: session.organizationId },
    select: { id: true, first_name: true, last_name: true, email: true },
    orderBy: { last_name: 'asc' },
  });

  return NextResponse.json(tenants);
}
