import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AcceptInviteClient } from './AcceptInviteClient';

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const session = await getSession();

  if (!session) redirect(`/login?redirect=/invite/accept?token=${token}`);
  if (!token) redirect('/dashboard');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full space-y-4'>
        <h1 className='text-xl font-semibold text-gray-900'>
          Accept Invitation
        </h1>
        <p className='text-sm text-gray-500'>
          You&apos;ve been invited to join an organization on RentStack. Click
          below to accept.
        </p>
        <AcceptInviteClient token={token} />
      </div>
    </div>
  );
}
