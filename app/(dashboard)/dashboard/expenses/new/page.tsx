'use client';
// app/(dashboard)/dashboard/expenses/new/page.tsx
import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createExpense } from '@/app/actions/expenses';

const CATEGORIES = [
  'repairs',
  'utilities',
  'insurance',
  'taxes',
  'maintenance',
  'cleaning',
  'management',
  'other',
];

type Property = { id: string; name: string };

export default function NewExpensePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    property_id: '',
    category: 'repairs',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetch('/api/dashboard/properties')
      .then((r) => r.json())
      .then(setProperties);
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      try {
        await createExpense(form);
        router.push('/dashboard/expenses');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const canSubmit = form.property_id && form.amount && form.date;

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link
          href='/dashboard/expenses'
          className='hover:text-white transition'
        >
          Expenses
        </Link>
        <span>/</span>
        <span className='text-white'>Log Expense</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>Log Expense</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        {/* Property */}
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Property *
          </label>
          <select
            value={form.property_id}
            onChange={(e) => update('property_id', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          >
            <option value=''>Select property…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Category *
          </label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Amount + Date */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Amount (₱) *
            </label>
            <input
              type='number'
              placeholder='e.g. 5000'
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Date *</label>
            <input
              type='date'
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Description
          </label>
          <input
            type='text'
            placeholder='e.g. Plumbing repair Unit 4A'
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        {error && (
          <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}
      </div>

      <div className='flex justify-between mt-6'>
        <Link
          href='/dashboard/expenses'
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Log Expense'}
        </button>
      </div>
    </div>
  );
}
