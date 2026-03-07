'use client';
// app/(dashboard)/dashboard/DashboardShell.tsx

import { useState } from 'react';
import Link from 'next/link';

type Stats = {
  properties: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  tenants: number;
  pendingRent: number;
};

type Props = {
  userName: string;
  userRole: string;
  stats: Stats;
};

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '▦' },
  { label: 'Properties', href: '/dashboard/properties', icon: '🏢' },
  { label: 'Units', href: '/dashboard/units', icon: '🚪' },
  { label: 'Tenants', href: '/dashboard/tenants', icon: '👥' },
  { label: 'Leases', href: '/dashboard/leases', icon: '📄' },
  { label: 'Payments', href: '/dashboard/payments', icon: '💳' },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: '🔧' },
  { label: 'Expenses', href: '/dashboard/expenses', icon: '📊' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardShell({ userName, userRole, stats }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const occupancyRate =
    stats.totalUnits > 0
      ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
      : 0;

  const statCards = [
    {
      label: 'Properties',
      value: stats.properties,
      sub: 'total listed',
      accent: 'indigo',
    },
    {
      label: 'Total Units',
      value: stats.totalUnits,
      sub: `${stats.availableUnits} available`,
      accent: 'violet',
    },
    {
      label: 'Occupancy',
      value: `${occupancyRate}%`,
      sub: `${stats.occupiedUnits} of ${stats.totalUnits} occupied`,
      accent: occupancyRate >= 80 ? 'emerald' : 'amber',
    },
    {
      label: 'Tenants',
      value: stats.tenants,
      sub: 'active renters',
      accent: 'sky',
    },
    {
      label: 'Pending Rent',
      value: `₱${stats.pendingRent.toLocaleString()}`,
      sub: 'awaiting payment',
      accent: stats.pendingRent > 0 ? 'rose' : 'emerald',
    },
  ];

  const accentMap: Record<string, string> = {
    indigo: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
    violet: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    sky: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
    rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white flex'>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className='px-6 py-5 border-b border-zinc-800'>
          <span className='text-xl font-bold tracking-tight'>RentStack</span>
          <p className='text-xs text-zinc-500 mt-0.5 capitalize'>
            {userRole} panel
          </p>
        </div>

        {/* Nav */}
        <nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition group'
            >
              <span className='text-base'>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className='px-4 py-4 border-t border-zinc-800'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0'>
              {getInitials(userName)}
            </div>
            <div className='overflow-hidden'>
              <p className='text-sm font-medium truncate'>{userName}</p>
              <p className='text-xs text-zinc-500 capitalize'>{userRole}</p>
            </div>
          </div>
          <Link
            href='/api/auth/logout'
            className='mt-3 w-full text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1.5'
          >
            ↩ Sign out
          </Link>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Topbar */}
        <header className='sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className='lg:hidden text-zinc-400 hover:text-white transition'
            >
              ☰
            </button>
            <div>
              <h1 className='text-lg font-semibold leading-tight'>Overview</h1>
              <p className='text-xs text-zinc-500'>
                {new Date().toLocaleDateString('en-PH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Link
            href='/dashboard/properties/new'
            className='text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition'
          >
            + Add Property
          </Link>
        </header>

        {/* Content */}
        <main className='flex-1 px-6 py-8 max-w-6xl w-full mx-auto'>
          {/* Welcome */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold'>
              Welcome back, {userName.split(' ')[0]} 👋
            </h2>
            <p className='text-zinc-400 text-sm mt-1'>
              Here&apos;s a snapshot of your portfolio.
            </p>
          </div>

          {/* Stat Cards */}
          <div className='grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10'>
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border p-5 ${accentMap[card.accent]}`}
              >
                <p className='text-xs uppercase tracking-widest opacity-60 mb-2'>
                  {card.label}
                </p>
                <p className='text-2xl font-bold text-white'>{card.value}</p>
                <p className='text-xs opacity-60 mt-1'>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className='mb-10'>
            <h3 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Quick Actions
            </h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {[
                {
                  label: 'Add Property',
                  href: '/dashboard/properties/new',
                  icon: '🏢',
                },
                {
                  label: 'Add Tenant',
                  href: '/dashboard/tenants/new',
                  icon: '👤',
                },
                {
                  label: 'New Lease',
                  href: '/dashboard/leases/new',
                  icon: '📄',
                },
                {
                  label: 'Log Expense',
                  href: '/dashboard/expenses/new',
                  icon: '📊',
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className='bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl px-4 py-4 flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition'
                >
                  <span className='text-lg'>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Empty state if no properties */}
          {stats.properties === 0 && (
            <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-12 text-center'>
              <p className='text-4xl mb-4'>🏢</p>
              <h3 className='text-lg font-semibold mb-2'>No properties yet</h3>
              <p className='text-zinc-500 text-sm mb-6'>
                Add your first property to start managing units and tenants.
              </p>
              <Link
                href='/dashboard/properties/new'
                className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
              >
                + Add your first property
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
