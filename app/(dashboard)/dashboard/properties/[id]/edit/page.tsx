// app/(dashboard)/dashboard/properties/[id]/edit/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import EditPropertyClient from './EditPropertyClient';

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const property = await prisma.property.findFirst({
    where: { id, organization_id: session.organizationId },
  });
  if (!property) notFound();

  return (
    <EditPropertyClient
      property={{
        ...property,
        property_type: property.property_type as string,
      }}
    />
  );
}
