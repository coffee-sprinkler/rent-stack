// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { prisma } from '@/db/prisma';
import { verifyToken } from '@/lib/auth';
import DashboardClient from './DashboardClient';

async function getAvailableUnits() {
  return prisma.unit.findMany({
    where: { status: 'available' },
    include: {
      property: true,
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
    orderBy: { rent_amount: 'asc' },
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
        avatar_url: true,
        role: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const [rawUnits, user] = await Promise.all([
    getAvailableUnits(),
    getCurrentUser(),
  ]);
  const units = rawUnits.map((u) => ({
    ...u,
    rent_amount: Number(u.rent_amount),
  }));
  return <DashboardClient units={units} user={user} />;
}

export const metadata = { title: 'Dashboard' };
