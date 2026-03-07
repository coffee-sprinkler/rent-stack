import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect('/login');

  const allowed = ['admin', 'manager'];
  if (!allowed.includes(session.role)) redirect('/portal');

  return <>{children}</>;
}
