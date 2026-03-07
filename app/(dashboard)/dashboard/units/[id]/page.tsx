import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/db/prisma';
import { verifyToken } from '@/lib/auth';
import UnitDetailClient from './UnitDetailClient';

async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      images: { orderBy: { order: 'asc' } },
    },
  });
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        saved_units: { select: { unit_id: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rawUnit, user] = await Promise.all([getUnit(id), getCurrentUser()]);

  if (!rawUnit) notFound();

  const unit = { ...rawUnit, rent_amount: Number(rawUnit.rent_amount) };
  const savedUnitIds = user?.saved_units.map((s) => s.unit_id) ?? [];

  return (
    <UnitDetailClient unit={unit} user={user} savedUnitIds={savedUnitIds} />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) return { title: 'Unit Not Found' };
  return { title: `${unit.property.name} — Unit ${unit.unit_number}` };
}
