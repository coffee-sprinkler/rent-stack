'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleSaveUnit } from '@/app/actions/units';

type Unit = {
  id: string;
  unit_number: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  status: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string | null;
    property_type: string;
  };
  images: { id: string; url: string; caption: string | null }[];
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
} | null;

type Props = {
  unit: Unit;
  user: User;
  savedUnitIds: string[];
};

type Tab = 'images' | 'details' | 'contact';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UnitDetailClient({ unit, user, savedUnitIds }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(savedUnitIds.includes(unit.id));
  const [isPending, startTransition] = useTransition();
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState('');

  function handleSave() {
    if (!user) return;
    setSaved((s) => !s);
    startTransition(async () => {
      await toggleSaveUnit(unit.id);
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'images', label: 'Photos' },
    { key: 'details', label: 'Details' },
    { key: 'contact', label: 'Contact' },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      {/* Nav */}
      <nav className='border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 bg-zinc-950/90 backdrop-blur'>
        <div className='max-w-5xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link
              href='/dashboard'
              className='text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-sm'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Back
            </Link>
            <span className='text-zinc-700'>/</span>
            <span className='text-xl font-bold tracking-tight'>RentStack</span>
          </div>

          <button
            onClick={handleSave}
            disabled={!user || isPending}
            title={
              user
                ? saved
                  ? 'Remove from saved'
                  : 'Save listing'
                : 'Log in to save'
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              saved
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
            } ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <svg
              className={`w-4 h-4 transition-all ${saved ? 'fill-rose-400 stroke-rose-400' : 'fill-none stroke-current'}`}
              viewBox='0 0 24 24'
              strokeWidth={1.8}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
              />
            </svg>
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </nav>

      <div className='max-w-5xl mx-auto px-6 py-10'>
        {/* Header */}
        <div className='mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
          <div>
            <p className='text-xs text-indigo-400 uppercase tracking-widest font-medium mb-1'>
              {unit.property.property_type}
            </p>
            <h1 className='text-3xl font-bold tracking-tight'>
              {unit.property.name}
              <span className='text-zinc-500'> — Unit {unit.unit_number}</span>
            </h1>
            <p className='text-zinc-500 text-sm mt-1.5'>
              {unit.property.city && `${unit.property.city} · `}
              {unit.property.address}
            </p>
          </div>
          <div className='sm:text-right shrink-0'>
            <p className='text-3xl font-bold text-indigo-400'>
              ₱{unit.rent_amount.toLocaleString()}
            </p>
            <p className='text-zinc-500 text-sm'>per month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-zinc-800 mb-8'>
          <div className='flex gap-1'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t' />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Photos */}
        {activeTab === 'images' && (
          <div className='space-y-4'>
            {unit.images.length === 0 ? (
              <div className='h-80 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center'>
                <p className='text-zinc-600'>
                  No photos available for this unit.
                </p>
              </div>
            ) : (
              <>
                {/* Main image */}
                <div className='relative h-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
                  <Image
                    src={unit.images[activeImage].url}
                    alt={
                      unit.images[activeImage].caption ??
                      `Unit ${unit.unit_number}`
                    }
                    fill
                    className='object-cover'
                    priority
                  />
                  {unit.images[activeImage].caption && (
                    <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent'>
                      <p className='text-sm text-zinc-300'>
                        {unit.images[activeImage].caption}
                      </p>
                    </div>
                  )}
                  {unit.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImage(
                            (i) =>
                              (i - 1 + unit.images.length) % unit.images.length,
                          )
                        }
                        className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur rounded-full flex items-center justify-center transition'
                      >
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setActiveImage((i) => (i + 1) % unit.images.length)
                        }
                        className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur rounded-full flex items-center justify-center transition'
                      >
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className='absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full px-3 py-1 text-xs text-zinc-300'>
                    {activeImage + 1} / {unit.images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {unit.images.length > 1 && (
                  <div className='flex gap-3 overflow-x-auto pb-1'>
                    {unit.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(idx)}
                        className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                          activeImage === idx
                            ? 'border-indigo-500'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.caption ?? ''}
                          fill
                          className='object-cover'
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <div className='space-y-6'>
            {/* Key stats */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { label: 'Bedrooms', value: `${unit.bedrooms}` },
                { label: 'Bathrooms', value: `${unit.bathrooms}` },
                { label: 'Floor', value: unit.floor ? `${unit.floor}` : '—' },
                {
                  label: 'Status',
                  value:
                    unit.status.charAt(0).toUpperCase() + unit.status.slice(1),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center'
                >
                  <p className='text-2xl font-bold text-white'>{stat.value}</p>
                  <p className='text-xs text-zinc-500 mt-1'>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
              <h3 className='text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider'>
                Location
              </h3>
              <p className='text-zinc-300 text-sm'>{unit.property.name}</p>
              <p className='text-zinc-500 text-sm mt-0.5'>
                {unit.property.address}
              </p>
              {unit.property.city && (
                <p className='text-zinc-500 text-sm'>{unit.property.city}</p>
              )}
            </div>

            {/* Pricing */}
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
              <h3 className='text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider'>
                Pricing
              </h3>
              <div className='flex items-center justify-between py-3 border-b border-zinc-800'>
                <span className='text-zinc-400 text-sm'>Monthly rent</span>
                <span className='text-white font-semibold'>
                  ₱{unit.rent_amount.toLocaleString()}
                </span>
              </div>
              <div className='flex items-center justify-between py-3 border-b border-zinc-800'>
                <span className='text-zinc-400 text-sm'>
                  Security deposit (est.)
                </span>
                <span className='text-white font-semibold'>
                  ₱{(unit.rent_amount * 2).toLocaleString()}
                </span>
              </div>
              <div className='flex items-center justify-between py-3'>
                <span className='text-zinc-400 text-sm'>
                  Move-in total (est.)
                </span>
                <span className='text-indigo-400 font-bold'>
                  ₱{(unit.rent_amount * 3).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('contact')}
              className='w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition text-sm'
            >
              Interested? Contact the landlord →
            </button>
          </div>
        )}

        {/* Tab: Contact */}
        {activeTab === 'contact' && (
          <div className='max-w-lg space-y-6'>
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
              <h3 className='text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider'>
                Send a message
              </h3>

              {!user ? (
                <div className='text-center py-8'>
                  <p className='text-zinc-400 text-sm mb-4'>
                    You need to be logged in to contact landlords.
                  </p>
                  <Link
                    href='/login'
                    className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition'
                  >
                    Log in
                  </Link>
                </div>
              ) : messageSent ? (
                <div className='text-center py-8'>
                  <div className='w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg
                      className='w-6 h-6 text-emerald-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  <p className='text-white font-medium'>Message sent!</p>
                  <p className='text-zinc-500 text-sm mt-1'>
                    The landlord will get back to you soon.
                  </p>
                  <button
                    onClick={() => {
                      setMessageSent(false);
                      setMessage('');
                    }}
                    className='mt-4 text-sm text-zinc-400 hover:text-white transition underline'
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div>
                    <label className='text-xs text-zinc-500 mb-1.5 block'>
                      Your name
                    </label>
                    <input
                      type='text'
                      defaultValue={user.name}
                      readOnly
                      className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white opacity-60 cursor-not-allowed'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-zinc-500 mb-1.5 block'>
                      Your email
                    </label>
                    <input
                      type='email'
                      defaultValue={user.email}
                      readOnly
                      className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white opacity-60 cursor-not-allowed'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-zinc-500 mb-1.5 block'>
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hi, I'm interested in Unit ${unit.unit_number} at ${unit.property.name}. Is it still available?`}
                      className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none'
                    />
                  </div>
                  <button
                    onClick={() => message.trim() && setMessageSent(true)}
                    disabled={!message.trim()}
                    className='w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm'
                  >
                    Send message
                  </button>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className='grid grid-cols-2 gap-3'>
              <a
                href='#'
                className='flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-sm font-medium py-3 rounded-xl transition'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
                Call
              </a>
              <button
                onClick={handleSave}
                disabled={!user || isPending}
                className={`flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl border transition ${
                  saved
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white'
                }`}
              >
                <svg
                  className={`w-4 h-4 ${saved ? 'fill-rose-400 stroke-rose-400' : 'fill-none stroke-current'}`}
                  viewBox='0 0 24 24'
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
                  />
                </svg>
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
