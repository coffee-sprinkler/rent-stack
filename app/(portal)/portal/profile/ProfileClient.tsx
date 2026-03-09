'use client';
// app/(portal)/portal/profile/ProfileClient.tsx

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type SavedUnit = {
  unit: {
    id: string;
    unit_number: string;
    bedrooms: number;
    bathrooms: number;
    rent_amount: string | number;
    floor: number | null;
    property: {
      name: string;
      street: string | null;
      city: string | null;
      property_type: string;
    };
    images: { url: string }[];
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  pref_min_budget: number | null;
  pref_max_budget: number | null;
  pref_location: string | null;
  pref_bedrooms: number | null;
  pref_property_type: string | null;
  saved_units: SavedUnit[];
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '');
  const [prefLocation, setPrefLocation] = useState(user.pref_location ?? '');
  const [prefMinBudget, setPrefMinBudget] = useState(
    user.pref_min_budget ? String(user.pref_min_budget) : '',
  );
  const [prefMaxBudget, setPrefMaxBudget] = useState(
    user.pref_max_budget ? String(user.pref_max_budget) : '',
  );
  const [prefBedrooms, setPrefBedrooms] = useState(
    user.pref_bedrooms ? String(user.pref_bedrooms) : '',
  );
  const [prefPropertyType, setPrefPropertyType] = useState(
    user.pref_property_type ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          avatar_url: avatarUrl,
          pref_location: prefLocation,
          pref_min_budget: prefMinBudget ? Number(prefMinBudget) : null,
          pref_max_budget: prefMaxBudget ? Number(prefMaxBudget) : null,
          pref_bedrooms: prefBedrooms ? Number(prefBedrooms) : null,
          pref_property_type: prefPropertyType || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='px-8 py-8 max-w-3xl mx-auto'>
      {/* Header */}
      <div className='flex items-center gap-5 mb-8'>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={72}
            height={72}
            className='rounded-full object-cover border-2 border-zinc-700'
          />
        ) : (
          <div className='w-[72px] h-[72px] rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0'>
            {getInitials(name)}
          </div>
        )}
        <div>
          <h1 className='text-2xl font-bold'>{user.name}</h1>
          <p className='text-zinc-500 text-sm'>
            {user.email} · <span className='capitalize'>{user.role}</span>
          </p>
        </div>
      </div>

      {/* Account Info */}
      <section className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 mb-6'>
        <h2 className='text-lg font-semibold'>Account Info</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Email</label>
            <input
              value={user.email}
              disabled
              className='w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+63 9XX XXX XXXX'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Avatar URL
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder='https://...'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>
      </section>

      {/* Rental Preferences */}
      <section className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 mb-6'>
        <div>
          <h2 className='text-lg font-semibold'>Rental Preferences</h2>
          <p className='text-xs text-zinc-500 mt-0.5'>
            Used to surface the best listings for you.
          </p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='sm:col-span-2'>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Preferred location
            </label>
            <input
              value={prefLocation}
              onChange={(e) => setPrefLocation(e.target.value)}
              placeholder='e.g. Makati, BGC, Quezon City…'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Min budget (₱/mo)
            </label>
            <input
              type='number'
              value={prefMinBudget}
              onChange={(e) => setPrefMinBudget(e.target.value)}
              placeholder='0'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Max budget (₱/mo)
            </label>
            <input
              type='number'
              value={prefMaxBudget}
              onChange={(e) => setPrefMaxBudget(e.target.value)}
              placeholder='Any'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Min bedrooms
            </label>
            <select
              value={prefBedrooms}
              onChange={(e) => setPrefBedrooms(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value=''>Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Property type
            </label>
            <select
              value={prefPropertyType}
              onChange={(e) => setPrefPropertyType(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value=''>Any</option>
              <option value='apartment'>Apartment</option>
              <option value='house'>House</option>
              <option value='condo'>Condo</option>
            </select>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className='flex items-center gap-3 mb-10'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg transition font-medium'
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <p className='text-sm text-emerald-400'>✓ Saved!</p>}
        {error && <p className='text-sm text-red-400'>{error}</p>}
      </div>

      {/* Saved Units */}
      {user.saved_units.length > 0 && (
        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>Saved Units</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {user.saved_units.map(({ unit }) => (
              <Link
                key={unit.id}
                href='/portal'
                className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex gap-4 p-4 hover:border-zinc-600 transition'
              >
                <div className='w-20 h-20 bg-zinc-800 rounded-xl flex-shrink-0 relative overflow-hidden'>
                  {unit.images[0] ? (
                    <Image
                      src={unit.images[0].url}
                      alt='unit'
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='h-full flex items-center justify-center text-zinc-600 text-xs'>
                      No img
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-zinc-500 uppercase tracking-widest'>
                    {unit.property.property_type}
                  </p>
                  <p className='font-medium text-sm mt-0.5 truncate'>
                    {unit.property.name} · Unit {unit.unit_number}
                  </p>
                  <p className='text-zinc-500 text-xs truncate'>
                    {unit.property.city}
                  </p>
                  <div className='flex items-center gap-3 mt-1.5 text-zinc-400 text-xs'>
                    <span>🛏 {unit.bedrooms}</span>
                    <span>🚿 {unit.bathrooms}</span>
                    <span className='text-indigo-400 font-semibold'>
                      ₱{Number(unit.rent_amount).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
