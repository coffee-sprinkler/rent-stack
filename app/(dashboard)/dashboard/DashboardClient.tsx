'use client';
// app/dashboard/DashboardClient.tsx

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Unit = {
  id: string;
  unit_number: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  rent_amount: string | number;
  status: string;
  property: {
    name: string;
    address: string;
    city: string | null;
    property_type: string;
  };
  images: { url: string; caption: string | null }[];
};

type User = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
};

type Props = {
  units: Unit[];
  user: User | null;
};

const PROPERTY_TYPES = ['apartment', 'house', 'condo'];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardClient({ units, user }: Props) {
  const [search, setSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [floor, setFloor] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const rent = Number(u.rent_amount);
      const loc =
        `${u.property.name} ${u.property.address} ${u.property.city ?? ''}`.toLowerCase();

      if (search && !loc.includes(search.toLowerCase())) return false;
      if (priceMin && rent < Number(priceMin)) return false;
      if (priceMax && rent > Number(priceMax)) return false;
      if (bedrooms && u.bedrooms < Number(bedrooms)) return false;
      if (bathrooms && u.bathrooms < Number(bathrooms)) return false;
      if (propertyType && u.property.property_type !== propertyType)
        return false;
      if (floor && u.floor !== Number(floor)) return false;
      return true;
    });
  }, [
    units,
    search,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
    propertyType,
    floor,
  ]);

  const hasListings = false; // will be true once user creates their first property

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      {/* Nav */}
      <nav className='border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 bg-zinc-950/90 backdrop-blur'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <span className='text-xl font-bold tracking-tight'>RentStack</span>

          <div className='flex items-center gap-4'>
            {hasListings && (
              <Link
                href='/dashboard/properties/new'
                className='text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition'
              >
                + Add listing
              </Link>
            )}

            {/* Profile dropdown */}
            <div className='relative'>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className='flex items-center gap-2 hover:opacity-80 transition'
              >
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    width={36}
                    height={36}
                    className='rounded-full object-cover border border-zinc-700'
                  />
                ) : (
                  <div className='w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold'>
                    {user ? getInitials(user.name) : '?'}
                  </div>
                )}
                <div className='text-left hidden sm:block'>
                  <p className='text-sm font-medium leading-tight'>
                    {user?.name ?? 'User'}
                  </p>
                  <p className='text-xs text-zinc-500'>{user?.role}</p>
                </div>
                <svg
                  className='w-4 h-4 text-zinc-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {profileOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden'>
                  <Link
                    href='/dashboard/profile'
                    onClick={() => setProfileOpen(false)}
                    className='flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-800 transition'
                  >
                    <span>👤</span> My Profile
                  </Link>
                  {!hasListings && (
                    <Link
                      href='/dashboard/properties/new'
                      onClick={() => setProfileOpen(false)}
                      className='flex items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-800 transition border-t border-zinc-800'
                    >
                      <span>🏠</span> List your property
                    </Link>
                  )}
                  <Link
                    href='/api/auth/logout'
                    className='flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition border-t border-zinc-800'
                  >
                    <span>↩</span> Sign out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className='max-w-7xl mx-auto px-6 py-14 text-center'>
        <p className='text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3'>
          Find your next home
        </p>
        <h1 className='text-4xl font-bold tracking-tight mb-3'>
          Available Units
        </h1>
        <p className='text-zinc-400 max-w-xl mx-auto'>
          Browse verified rental listings — filter by location, budget, and
          more.
        </p>
      </section>

      {/* Filters */}
      <section className='max-w-7xl mx-auto px-6 mb-8'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
          {/* Location search */}
          <div className='col-span-2 sm:col-span-3 lg:col-span-2'>
            <label className='text-xs text-zinc-500 mb-1 block'>Location</label>
            <input
              type='text'
              placeholder='City, building, address…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>

          {/* Price range */}
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>
              Min price (₱)
            </label>
            <input
              type='number'
              placeholder='0'
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>
              Max price (₱)
            </label>
            <input
              type='number'
              placeholder='Any'
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>

          {/* Property type */}
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value=''>All types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>Min beds</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value=''>Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>
              Min baths
            </label>
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            >
              <option value=''>Any</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className='text-xs text-zinc-500 mb-1 block'>Floor</label>
            <input
              type='number'
              placeholder='Any'
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>

          {/* Reset */}
          <div className='flex items-end'>
            <button
              onClick={() => {
                setSearch('');
                setPriceMin('');
                setPriceMax('');
                setBedrooms('');
                setBathrooms('');
                setPropertyType('');
                setFloor('');
              }}
              className='w-full border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm rounded-lg py-2 transition'
            >
              Reset
            </button>
          </div>
        </div>

        <p className='text-xs text-zinc-600 mt-2 pl-1'>
          {filtered.length} unit{filtered.length !== 1 ? 's' : ''} found
        </p>
      </section>

      {/* Units Grid */}
      <section className='max-w-7xl mx-auto px-6 pb-24'>
        {filtered.length === 0 ? (
          <div className='text-center py-24 text-zinc-600'>
            <p className='text-lg'>No units match your filters.</p>
            <p className='text-sm mt-2'>Try adjusting your search.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filtered.map((unit) => (
              <div
                key={unit.id}
                className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition group'
              >
                {/* Image */}
                <div className='h-48 bg-zinc-800 relative overflow-hidden'>
                  {unit.images[0] ? (
                    <Image
                      src={unit.images[0].url}
                      alt={unit.images[0].caption ?? `Unit ${unit.unit_number}`}
                      fill
                      className='object-cover group-hover:scale-105 transition duration-300'
                    />
                  ) : (
                    <div className='h-full flex items-center justify-center group-hover:bg-zinc-700 transition'>
                      <span className='text-zinc-600 text-sm'>
                        Unit {unit.unit_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='p-5 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-xs text-zinc-500 uppercase tracking-widest'>
                        {unit.property.property_type}
                      </p>
                      <h3 className='text-white font-semibold mt-0.5'>
                        {unit.property.name} — Unit {unit.unit_number}
                      </h3>
                    </div>
                    <span className='text-indigo-400 font-bold text-sm whitespace-nowrap'>
                      ₱{Number(unit.rent_amount).toLocaleString()}/mo
                    </span>
                  </div>

                  <p className='text-zinc-500 text-xs'>
                    {unit.property.city ? `${unit.property.city} · ` : ''}
                    {unit.property.address}
                  </p>

                  <div className='flex items-center gap-4 text-zinc-400 text-sm pt-1'>
                    <span>🛏 {unit.bedrooms} bed</span>
                    <span>🚿 {unit.bathrooms} bath</span>
                    {unit.floor && <span>Floor {unit.floor}</span>}
                  </div>

                  <button className='w-full mt-2 border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 text-zinc-300 text-sm rounded-lg py-2 transition'>
                    Contact to apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-800 px-6 py-8 text-center text-zinc-600 text-sm'>
        © {new Date().getFullYear()} RentStack. All rights reserved.
      </footer>
    </div>
  );
}
