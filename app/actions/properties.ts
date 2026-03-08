'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { PropertyType } from '@prisma/client';

type PropertyInput = {
  name: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  property_type: string;
};

type UnitInput = {
  unit_number: string;
  floor: string;
  bedrooms: string;
  bathrooms: string;
  rent_amount: string;
};

type ImageInput = {
  url: string;
  caption: string;
};

export async function createProperty({
  property,
  unit,
  images = [],
}: {
  property: PropertyInput;
  unit: UnitInput;
  images?: ImageInput[];
}) {
  const session = await getSession();
  if (!session?.organizationId) throw new Error('Unauthorized');

  const newProperty = await prisma.property.create({
    data: {
      organization_id: session.organizationId,
      name: property.name.trim(),
      province: property.province || null,
      city: property.city || null,
      barangay: property.barangay.trim() || null,
      street: property.street.trim() || null,
      property_type: property.property_type as PropertyType,
    },
  });

  const newUnit = await prisma.unit.create({
    data: {
      property_id: newProperty.id,
      unit_number: unit.unit_number.trim(),
      floor: unit.floor ? parseInt(unit.floor) : null,
      bedrooms: parseInt(unit.bedrooms),
      bathrooms: parseInt(unit.bathrooms),
      rent_amount: parseFloat(unit.rent_amount),
    },
  });

  if (images.length > 0) {
    await prisma.unitImage.createMany({
      data: images.map((img, idx) => ({
        unit_id: newUnit.id,
        url: img.url,
        caption: img.caption || null,
        order: idx,
      })),
    });
  }

  return { propertyId: newProperty.id, unitId: newUnit.id };
}
