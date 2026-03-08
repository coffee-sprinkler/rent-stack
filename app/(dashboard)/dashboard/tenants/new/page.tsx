'use client';
// app/(dashboard)/dashboard/tenants/new/page.tsx
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTenant } from '@/app/actions/tenants';

export default function NewTenantPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    emergency_contact: '',
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      try {
        const tenant = await createTenant(form);
        router.push(`/dashboard/tenants/${tenant.id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const canSubmit =
    form.first_name.trim() && form.last_name.trim() && form.email.trim();

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/tenants' className='hover:text-white transition'>
          Tenants
        </Link>
        <span>/</span>
        <span className='text-white'>New Tenant</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>Add Tenant</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <div className='grid grid-cols-2 gap-4'>
          {[
            { field: 'first_name', label: 'First Name *', placeholder: 'Juan' },
            { field: 'last_name', label: 'Last Name *', placeholder: 'Santos' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className='text-xs text-zinc-500 mb-1.5 block'>
                {label}
              </label>
              <input
                type='text'
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={(e) =>
                  update(field as keyof typeof form, e.target.value)
                }
                className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
              />
            </div>
          ))}
        </div>

        {[
          {
            field: 'email',
            label: 'Email *',
            type: 'email',
            placeholder: 'juan@example.com',
          },
          {
            field: 'phone',
            label: 'Phone',
            type: 'text',
            placeholder: '+63 9XX XXX XXXX',
          },
          {
            field: 'emergency_contact',
            label: 'Emergency Contact',
            type: 'text',
            placeholder: 'Name — +63 9XX XXX XXXX',
          },
        ].map(({ field, label, type, placeholder }) => (
          <div key={field}>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                update(field as keyof typeof form, e.target.value)
              }
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        ))}

        {error && (
          <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}
      </div>

      <div className='flex justify-between mt-6'>
        <Link
          href='/dashboard/tenants'
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Add Tenant'}
        </button>
      </div>
    </div>
  );
}
