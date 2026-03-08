'use client';
// app/(dashboard)/dashboard/leases/new/page.tsx
import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createLease } from '@/app/actions/leases';

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};
type Unit = {
  id: string;
  unit_number: string;
  property: { name: string };
  rent_amount: string;
};

export default function NewLeasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState({
    tenant_id: searchParams.get('tenantId') ?? '',
    unit_id: searchParams.get('unitId') ?? '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    deposit_amount: '',
  });

  useEffect(() => {
    fetch('/api/dashboard/tenants')
      .then((r) => r.json())
      .then(setTenants);
    fetch('/api/dashboard/units/available')
      .then((r) => r.json())
      .then(setUnits);
  }, []);

  // Auto-fill rent when unit is selected
  useEffect(() => {
    if (!form.unit_id) return;
    const unit = units.find((u) => u.id === form.unit_id);
    if (unit)
      setTimeout(
        () => setForm((f) => ({ ...f, monthly_rent: unit.rent_amount })),
        0,
      );
  }, [form.unit_id, units]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      try {
        const lease = await createLease(form);
        router.push(`/dashboard/leases/${lease.id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const canSubmit =
    form.tenant_id &&
    form.unit_id &&
    form.start_date &&
    form.end_date &&
    form.monthly_rent &&
    form.deposit_amount;

  return (
    <div className='px-8 py-8 max-w-2xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/leases' className='hover:text-white transition'>
          Leases
        </Link>
        <span>/</span>
        <span className='text-white'>New Lease</span>
      </div>

      <h1 className='text-2xl font-bold mb-8'>New Lease</h1>

      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        {/* Tenant */}
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Tenant *</label>
          <select
            value={form.tenant_id}
            onChange={(e) => update('tenant_id', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          >
            <option value=''>Select tenant…</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name} — {t.email}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Unit *</label>
          <select
            value={form.unit_id}
            onChange={(e) => update('unit_id', e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          >
            <option value=''>Select unit…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unit_number} — {u.property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className='grid grid-cols-2 gap-4'>
          {[
            { field: 'start_date', label: 'Start Date *' },
            { field: 'end_date', label: 'End Date *' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className='text-xs text-zinc-500 mb-1.5 block'>
                {label}
              </label>
              <input
                type='date'
                value={form[field as keyof typeof form]}
                onChange={(e) =>
                  update(field as keyof typeof form, e.target.value)
                }
                className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
              />
            </div>
          ))}
        </div>

        {/* Financials */}
        <div className='grid grid-cols-2 gap-4'>
          {[
            {
              field: 'monthly_rent',
              label: 'Monthly Rent (₱) *',
              placeholder: '15000',
            },
            {
              field: 'deposit_amount',
              label: 'Deposit Amount (₱) *',
              placeholder: '30000',
            },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className='text-xs text-zinc-500 mb-1.5 block'>
                {label}
              </label>
              <input
                type='number'
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

        {error && (
          <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}
      </div>

      <div className='flex justify-between mt-6'>
        <Link
          href='/dashboard/leases'
          className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Creating…' : 'Create Lease'}
        </button>
      </div>
    </div>
  );
}
