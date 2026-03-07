// app/(dashboard)/dashboard/layout.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const allowed = ['admin', 'manager'];
  if (!allowed.includes(session.role)) redirect('/portal');

  return (
    <DashboardShell userName={session.name ?? ''} userRole={session.role}>
      {children}
    </DashboardShell>
  );
}
