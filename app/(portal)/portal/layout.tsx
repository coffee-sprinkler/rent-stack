// app/(portal)/portal/layout.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import PortalShell from './PortalShell';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'tenant') redirect('/dashboard');

  return (
    <PortalShell userName={session.name ?? 'Tenant'}>{children}</PortalShell>
  );
}
