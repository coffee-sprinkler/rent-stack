'use client';
// app/(portal)/portal/maintenance/MaintenanceClient.tsx

import { useState, useTransition } from 'react';
import { submitMaintenanceRequest } from '@/app/actions/maintenance';

type Request = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  unit: { unit_number: string; property: { name: string } };
};

type Props = {
  requests: Request[];
  tenantId: string | null;
  activeUnit: { id: string; unit_number: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  open: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function MaintenanceClient({
  requests,
  tenantId,
  activeUnit,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'low',
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!tenantId || !activeUnit) return;
    setError('');
    setSuccess('');
    startTransition(async () => {
      try {
        await submitMaintenanceRequest({
          tenant_id: tenantId,
          unit_id: activeUnit.id,
          ...form,
        });
        setSuccess('Request submitted successfully.');
        setForm({ title: '', description: '', priority: 'low' });
        setShowForm(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const canSubmit = form.title.trim() && form.description.trim();

  return (
    <div className='px-8 py-8 max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold'>Maintenance</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            Submit and track maintenance requests
          </p>
        </div>
        {activeUnit && (
          <button
            onClick={() => setShowForm((o) => !o)}
            className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
          >
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {/* No lease warning */}
      {!activeUnit && (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-center'>
          <p className='text-zinc-500 text-sm'>
            You need an active lease to submit maintenance requests.
          </p>
        </div>
      )}

      {/* Submit form */}
      {showForm && activeUnit && (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 space-y-4'>
          <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest'>
            New Request — Unit {activeUnit.unit_number}
          </h2>

          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Title *
            </label>
            <input
              type='text'
              placeholder='e.g. Leaking faucet in bathroom'
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>

          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Description *
            </label>
            <textarea
              placeholder='Describe the issue in detail…'
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none'
            />
          </div>

          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>

          {error && (
            <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
              {error}
            </p>
          )}

          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm'
            >
              {isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className='bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-6'>
          {success}
        </div>
      )}

      {/* Requests list */}
      {requests.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>🔧</p>
          <h3 className='text-lg font-semibold mb-2'>No requests yet</h3>
          <p className='text-zinc-500 text-sm'>
            Submit a request if something needs fixing.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {requests.map((r) => (
            <div
              key={r.id}
              className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'
            >
              <div className='flex items-start justify-between gap-3 mb-2'>
                <p className='text-white font-medium'>{r.title}</p>
                <div className='flex gap-2 shrink-0'>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize ${PRIORITY_STYLES[r.priority]}`}
                  >
                    {r.priority}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className='text-zinc-500 text-sm'>{r.description}</p>
              <p className='text-xs text-zinc-600 mt-2'>
                Unit {r.unit.unit_number} · {r.unit.property.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
