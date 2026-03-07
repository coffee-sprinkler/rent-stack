import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import NewPropertyClient from './NewPropertyClient';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <NewPropertyClient />;
}

export const metadata = { title: 'List your property' };
