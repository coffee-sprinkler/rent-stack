'use client';
// app/(dashboard)/dashboard/DashboardShell.tsx

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  userName: string;
  userRole: string;
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', exact: true, icon: '▦' },
  { label: 'Applications', href: '/dashboard/applications', icon: '📬' },
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

export default function DashboardShell({
  userName,
  userRole,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className='min-h-screen bg-zinc-950 text-white flex'>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0`}
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
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className='text-base'>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
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
            href='/dashboard/profile'
            className='mt-3 w-full text-xs text-zinc-500 hover:text-white transition flex items-center gap-1.5'
          >
            👤 My Profile
          </Link>
          <Link
            href='/api/auth/logout'
            className='mt-3 w-full text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1.5'
          >
            ↩ Sign out
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Topbar — mobile only hamburger */}
        <header className='sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center gap-3 lg:hidden'>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className='text-zinc-400 hover:text-white transition'
          >
            ☰
          </button>
          <span className='text-sm font-semibold'>RentStack</span>
        </header>

        {/* Page content injected here */}
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
