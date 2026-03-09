// app/(dashboard)/dashboard/profile/page.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/prisma';
import ProfileClient from './ProfileClient';

export default async function DashboardProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
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
