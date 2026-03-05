// app/dashboard/profile/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/prisma';
import { verifyToken } from '@/lib/auth';
import ProfileClient from './ProfileClient';

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
        pref_min_budget: true,
        pref_max_budget: true,
        pref_location: true,
        pref_bedrooms: true,
        pref_property_type: true,
        saved_units: {
          include: {
            unit: {
              include: {
                property: true,
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const serialized = {
    ...user,
    pref_min_budget: user.pref_min_budget ? Number(user.pref_min_budget) : null,
    pref_max_budget: user.pref_max_budget ? Number(user.pref_max_budget) : null,
    saved_units: user.saved_units.map((s) => ({
      ...s,
      unit: { ...s.unit, rent_amount: Number(s.unit.rent_amount) },
    })),
  };

  return <ProfileClient user={serialized} />;
}

export const metadata = { title: 'Profile' };
