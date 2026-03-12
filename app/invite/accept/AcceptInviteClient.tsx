'use client';

import { useState, useTransition } from 'react';
import { acceptInvite } from '@/app/actions/organization';
import { useRouter } from 'next/navigation';

type Props = {
  token: string;
};

export function AcceptInviteClient({ token }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      try {
        await acceptInvite(token);
        router.push('/dashboard');
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to accept invitation.',
        );
      }
    });
  };

  return (
    <div className='space-y-3'>
      {error && (
        <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2'>
          {error}
        </p>
      )}
      <button
        type='button'
        onClick={handleAccept}
        disabled={isPending}
        className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition'
      >
        {isPending ? 'Accepting...' : 'Accept Invitation'}
      </button>
    </div>
  );
}
