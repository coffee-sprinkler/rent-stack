// app/(dashboard)/dashboard/units/[id]/edit/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import EditUnitClient from './EditUnitClient';

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const unit = await prisma.unit.findFirst({
    where: { id, property: { organization_id: session.organizationId } },
    include: { property: true },
  });
  if (!unit) notFound();

  return (
    <EditUnitClient
      unit={{
        ...unit,
        rent_amount: Number(unit.rent_amount),
        status: unit.status as string,
      }}
    />
  );
}
