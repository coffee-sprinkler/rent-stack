'use client';
// app/(dashboard)/dashboard/units/[id]/edit/EditUnitClient.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateUnit } from '@/app/actions/edit';

type Unit = {
  id: string;
  unit_number: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  status: string;
  property: { id: string; name: string };
};

export default function EditUnitClient({ unit }: { unit: Unit }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    unit_number: unit.unit_number,
    floor: unit.floor ? String(unit.floor) : '',
    bedrooms: String(unit.bedrooms),
    bathrooms: String(unit.bathrooms),
    rent_amount: String(unit.rent_amount),
    status: unit.status,
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    setError('');
    startTransition(async () => {
      try {
        await updateUnit(unit.id, form);
        router.push(`/dashboard/units/${unit.id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/units' className='hover:text-white transition'>
          Units
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/units/${unit.id}`}
          className='hover:text-white transition'
        >
          Unit {unit.unit_number}
        </Link>
        <span>/</span>
        <span className='text-white'>Edit</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>Edit Unit</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Unit Number *
            </label>
            <input
              value={form.unit_number}
              onChange={(e) => update('unit_number', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Floor</label>
            <input
              type='number'
              value={form.floor}
              onChange={(e) => update('floor', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Bedrooms *
            </label>
            <input
              type='number'
              value={form.bedrooms}
              onChange={(e) => update('bedrooms', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Bathrooms *
            </label>
            <input
              type='number'
              value={form.bathrooms}
              onChange={(e) => update('bathrooms', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Rent Amount (₱) *
            </label>
            <input
              type='number'
              value={form.rent_amount}
              onChange={(e) => update('rent_amount', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Status *
            </label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value='available'>Available</option>
              <option value='occupied'>Occupied</option>
              <option value='maintenance'>Maintenance</option>
            </select>
          </div>
        </div>

        {error && (
          <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}
      </div>

      <div className='flex justify-between mt-6'>
        <Link
          href={`/dashboard/units/${unit.id}`}
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={!form.unit_number || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
