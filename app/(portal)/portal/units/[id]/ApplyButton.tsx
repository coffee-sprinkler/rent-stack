'use client';
// app/(portal)/portal/units/[id]/ApplyButton.tsx

import { useState, useTransition } from 'react';
import { applyForUnit } from '@/app/actions/applications';
import { useRouter } from 'next/navigation';

export default function ApplyButton({
  unitId,
  hasExisting,
}: {
  unitId: string;
  hasExisting: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (hasExisting) {
    return (
      <div className='bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center'>
        <p className='text-amber-400 text-sm font-medium'>
          You already have a pending application for this unit.
        </p>
      </div>
    );
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      try {
        await applyForUnit(unitId, message);
        router.push('/portal/applications');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
      <h2 className='text-lg font-semibold mb-1'>Interested in this unit?</h2>
      <p className='text-zinc-500 text-sm mb-4'>
        Send a lease application to the landlord.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className='w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition'
        >
          Apply Now
        </button>
      ) : (
        <div className='space-y-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Message to landlord (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Tell the landlord a bit about yourself…'
              rows={3}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none'
            />
          </div>
          {error && <p className='text-red-400 text-sm'>{error}</p>}
          <div className='flex gap-3'>
            <button
              onClick={() => setShowForm(false)}
              className='flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white py-2.5 rounded-xl text-sm transition'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className='flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition'
            >
              {isPending ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
