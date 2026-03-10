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
      payment_methods: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!user) redirect('/login');

  return <ProfileClient user={user} />;
}

export const metadata = { title: 'Profile' };
