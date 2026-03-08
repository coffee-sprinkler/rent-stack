'use server';
// app/actions/tenants.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function createTenant(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact: string;
}) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  return prisma.tenant.create({
    data: {
      organization_id: session.organizationId,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim() || null,
      emergency_contact: data.emergency_contact.trim() || null,
    },
  });
}
