// app/(portal)/portal/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [units, user, savedUnits] = await Promise.all([
    prisma.unit.findMany({
      where: { status: 'available' },
      include: {
        property: true,
        images: { orderBy: { order: 'asc' } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        role: true,
      },
    }),
    prisma.savedUnit.findMany({
      where: { user_id: session.userId },
      select: { unit_id: true },
    }),
  ]);

  return (
    <DashboardClient
      units={units.map((u) => ({
        ...u,
        rent_amount: u.rent_amount.toString(),
        property: {
          ...u.property,
          address: [u.property.street, u.property.barangay]
            .filter(Boolean)
            .join(', '),
        },
      }))}
      user={user}
      savedUnitIds={savedUnits.map((s) => s.unit_id)}
    />
  );
}
