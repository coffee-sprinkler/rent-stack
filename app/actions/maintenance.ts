'use server';
// app/actions/maintenance.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function updateMaintenanceStatus(
  requestId: string,
  status: 'open' | 'in_progress' | 'resolved',
) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { unit: { include: { property: true } } },
  });
  if (!request) throw new Error('Request not found');
  if (request.unit.property.organization_id !== session.organizationId)
    throw new Error('Unauthorized');

  return prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status },
  });
}

export async function submitMaintenanceRequest(data: {
  tenant_id: string;
  unit_id: string;
  title: string;
  description: string;
  priority: string;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return prisma.maintenanceRequest.create({
    data: {
      tenant_id: data.tenant_id,
      unit_id: data.unit_id,
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority as 'low' | 'medium' | 'high',
      status: 'open',
    },
  });
}
