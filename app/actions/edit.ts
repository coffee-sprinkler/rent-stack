'use server';
// app/actions/edit.ts
import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';

export async function updateProperty(
  id: string,
  data: {
    name: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    property_type: string;
  },
) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const property = await prisma.property.findFirst({
    where: { id, organization_id: session.organizationId },
  });
  if (!property) throw new Error('Property not found');

  return prisma.property.update({
    where: { id },
    data: {
      name: data.name.trim(),
      province: data.province || null,
      city: data.city || null,
      barangay: data.barangay || null,
      street: data.street || null,
      property_type: data.property_type as 'apartment' | 'house' | 'condo',
    },
  });
}

export async function updateUnit(
  id: string,
  data: {
    unit_number: string;
    floor: string;
    bedrooms: string;
    bathrooms: string;
    rent_amount: string;
    status: string;
  },
) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const unit = await prisma.unit.findFirst({
    where: { id, property: { organization_id: session.organizationId } },
  });
  if (!unit) throw new Error('Unit not found');

  return prisma.unit.update({
    where: { id },
    data: {
      unit_number: data.unit_number.trim(),
      floor: data.floor ? parseInt(data.floor) : null,
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      rent_amount: parseFloat(data.rent_amount),
      status: data.status as 'available' | 'occupied' | 'maintenance',
    },
  });
}

export async function updateTenant(
  id: string,
  data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    emergency_contact: string;
  },
) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const tenant = await prisma.tenant.findFirst({
    where: { id, organization_id: session.organizationId },
  });
  if (!tenant) throw new Error('Tenant not found');

  return prisma.tenant.update({
    where: { id },
    data: {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone || null,
      emergency_contact: data.emergency_contact || null,
    },
  });
}
