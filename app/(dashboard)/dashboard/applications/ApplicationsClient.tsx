'use client';
// app/(dashboard)/dashboard/applications/ApplicationsClient.tsx

import { useState, useTransition } from 'react';
import {
  approveApplication,
  rejectApplication,
} from '@/app/actions/applications';

type Application = {
  id: string;
  status: string;
  message: string | null;
  created_at: Date;
  user: { id: string; name: string; email: string; phone: string | null };
  unit: {
    id: string;
    unit_number: string;
    rent_amount: number;
    property: { name: string; city: string | null };
  };
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  rejected: 'text-zinc-500 bg-zinc-800 border-zinc-700',
};

function ApplicationRow({ application }: { application: Application }) {
  const [status, setStatus] = useState(application.status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveApplication(application.id);
        setStatus('approved');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectApplication(application.id);
        setStatus('rejected');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
      <div className='flex items-start justify-between gap-4 mb-3'>
        <div>
          <p className='font-medium text-white'>{application.user.name}</p>
          <p className='text-xs text-zinc-500'>
            {application.user.email}
            {application.user.phone ? ` · ${application.user.phone}` : ''}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border capitalize shrink-0 ${STATUS_STYLES[status]}`}
        >
          {status}
        </span>
      </div>

      <div className='flex items-center gap-2 text-sm text-zinc-400 mb-3'>
        <span className='text-white font-medium'>
          {application.unit.property.name} — Unit {application.unit.unit_number}
        </span>
        {application.unit.property.city && (
          <span>· {application.unit.property.city}</span>
        )}
        <span>· ₱{application.unit.rent_amount.toLocaleString()}/mo</span>
      </div>

      {application.message && (
        <p className='text-sm text-zinc-400 bg-zinc-800 rounded-xl px-4 py-3 mb-3 italic'>
          &quot;{application.message}&quot;
        </p>
      )}

      <div className='flex items-center justify-between'>
        <p className='text-xs text-zinc-600'>
          {new Date(application.created_at).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {status === 'pending' && (
          <div className='flex gap-2'>
            <button
              onClick={handleReject}
              disabled={isPending}
              className='text-xs px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition disabled:opacity-40'
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className='text-xs px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40'
            >
              {isPending ? 'Processing…' : 'Approve'}
            </button>
          </div>
        )}
      </div>
      {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}
    </div>
  );
}

export default function ApplicationsClient({
  applications,
}: {
  applications: Application[];
}) {
  const pending = applications.filter((a) => a.status === 'pending');
  const others = applications.filter((a) => a.status !== 'pending');

  return (
    <div className='px-8 py-8 max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Applications</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {pending.length} pending · {applications.length} total
        </p>
      </div>

      {applications.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>📬</p>
          <h3 className='text-lg font-semibold mb-2'>No applications yet</h3>
          <p className='text-zinc-500 text-sm'>
            Applications from tenants will appear here.
          </p>
        </div>
      ) : (
        <div className='space-y-8'>
          {pending.length > 0 && (
            <div>
              <h2 className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
                Pending
              </h2>
              <div className='space-y-3'>
                {pending.map((a) => (
                  <ApplicationRow key={a.id} application={a} />
                ))}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
                Reviewed
              </h2>
              <div className='space-y-3'>
                {others.map((a) => (
                  <ApplicationRow key={a.id} application={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
