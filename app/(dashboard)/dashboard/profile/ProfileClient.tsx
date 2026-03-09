'use client';
// app/(dashboard)/dashboard/profile/ProfileClient.tsx

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
  saved_units: unknown[];
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
        body: JSON.stringify({ name, phone, avatar_url: avatarUrl }),
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
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard' className='hover:text-white transition'>
          Dashboard
        </Link>
        <span>/</span>
        <span className='text-white'>Profile</span>
      </div>

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

      {/* Save */}
      <div className='flex items-center gap-3'>
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
    </div>
  );
}
