// app/(dashboard)/dashboard/tenants/[id]/edit/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import EditTenantClient from './EditTenantClient';

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const tenant = await prisma.tenant.findFirst({
    where: { id, organization_id: session.organizationId },
  });
  if (!tenant) notFound();

  return <EditTenantClient tenant={tenant} />;
}
