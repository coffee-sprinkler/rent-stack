'use client';
// app/(dashboard)/dashboard/properties/[id]/edit/EditPropertyClient.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProperty } from '@/app/actions/edit';

type Property = {
  id: string;
  name: string;
  province: string | null;
  city: string | null;
  barangay: string | null;
  street: string | null;
  property_type: string;
};

const PROPERTY_TYPES = ['apartment', 'house', 'condo'];

export default function EditPropertyClient({
  property,
}: {
  property: Property;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: property.name,
    province: property.province ?? '',
    city: property.city ?? '',
    barangay: property.barangay ?? '',
    street: property.street ?? '',
    property_type: property.property_type,
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    setError('');
    startTransition(async () => {
      try {
        await updateProperty(property.id, form);
        router.push(`/dashboard/properties/${property.id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link
          href='/dashboard/properties'
          className='hover:text-white transition'
        >
          Properties
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/properties/${property.id}`}
          className='hover:text-white transition'
        >
          {property.name}
        </Link>
        <span>/</span>
        <span className='text-white'>Edit</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>Edit Property</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Property Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Type *</label>
          <select
            value={form.property_type}
            onChange={(e) => update('property_type', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Province
            </label>
            <input
              value={form.province}
              onChange={(e) => update('province', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>City</label>
            <input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Barangay
            </label>
            <input
              value={form.barangay}
              onChange={(e) => update('barangay', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Street</label>
            <input
              value={form.street}
              onChange={(e) => update('street', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
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
          href={`/dashboard/properties/${property.id}`}
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={!form.name || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
