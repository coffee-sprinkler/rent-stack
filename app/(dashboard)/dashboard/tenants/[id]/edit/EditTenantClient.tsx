'use client';
// app/(dashboard)/dashboard/tenants/[id]/edit/EditTenantClient.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateTenant } from '@/app/actions/edit';

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  emergency_contact: string | null;
};

export default function EditTenantClient({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: tenant.first_name,
    last_name: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone ?? '',
    emergency_contact: tenant.emergency_contact ?? '',
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    setError('');
    startTransition(async () => {
      try {
        await updateTenant(tenant.id, form);
        router.push(`/dashboard/tenants/${tenant.id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/tenants' className='hover:text-white transition'>
          Tenants
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/tenants/${tenant.id}`}
          className='hover:text-white transition'
        >
          {tenant.first_name} {tenant.last_name}
        </Link>
        <span>/</span>
        <span className='text-white'>Edit</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>Edit Tenant</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              First Name *
            </label>
            <input
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Last Name *
            </label>
            <input
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Email *</label>
          <input
            type='email'
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder='+63 9XX XXX XXXX'
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Emergency Contact
          </label>
          <input
            value={form.emergency_contact}
            onChange={(e) => update('emergency_contact', e.target.value)}
            placeholder='Name and number'
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
          href={`/dashboard/tenants/${tenant.id}`}
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={!form.first_name || !form.last_name || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
