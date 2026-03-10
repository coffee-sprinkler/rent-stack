// app/(portal)/portal/layout.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/prisma';
import PortalShell from './PortalShell';
import UnverifiedBanner from '@/components/ui/UnverifiedBanner';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'tenant') redirect('/dashboard');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email_verified: true },
  });

  return (
    <PortalShell userName={session.name ?? 'Tenant'}>
      {!user?.email_verified && <UnverifiedBanner />}
      {children}
    </PortalShell>
  );
}
