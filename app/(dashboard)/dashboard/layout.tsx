// app/(dashboard)/dashboard/layout.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/prisma';
import DashboardShell from './DashboardShell';
import UnverifiedBanner from '@/components/ui/UnverifiedBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'tenant') redirect('/portal');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email_verified: true },
  });

  return (
    <DashboardShell
      userName={session.name ?? ''}
      userRole={session.role}
      isOrgAdmin={session.isOrgAdmin}
    >
      {!user?.email_verified && <UnverifiedBanner />}
      {children}
    </DashboardShell>
  );
}
