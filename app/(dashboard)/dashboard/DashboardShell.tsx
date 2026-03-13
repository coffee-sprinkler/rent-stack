'use client';
// app/(dashboard)/dashboard/DashboardShell.tsx

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

type Props = {
  userName: string;
  userRole: string;
  isOrgAdmin?: boolean;
  children: React.ReactNode;
};

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        exact: true,
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect width='7' height='7' x='3' y='3' rx='1' />
            <rect width='7' height='7' x='14' y='3' rx='1' />
            <rect width='7' height='7' x='14' y='14' rx='1' />
            <rect width='7' height='7' x='3' y='14' rx='1' />
          </svg>
        ),
      },
      {
        label: 'Applications',
        href: '/dashboard/applications',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect width='16' height='20' x='4' y='2' rx='2' />
            <line x1='8' x2='16' y1='7' y2='7' />
            <line x1='8' x2='16' y1='11' y2='11' />
            <line x1='8' x2='12' y1='15' y2='15' />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Properties',
    items: [
      {
        label: 'Properties',
        href: '/dashboard/properties',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
            <polyline points='9 22 9 12 15 12 15 22' />
          </svg>
        ),
      },
      {
        label: 'Units',
        href: '/dashboard/units',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2' />
            <path d='M21 14H3' />
            <path d='M21 7v13H3V7' />
            <path d='M9 21v-6h6v6' />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Tenants',
        href: '/dashboard/tenants',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
        ),
      },
      {
        label: 'Leases',
        href: '/dashboard/leases',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <polyline points='14 2 14 8 20 8' />
            <line x1='16' x2='8' y1='13' y2='13' />
            <line x1='16' x2='8' y1='17' y2='17' />
            <polyline points='10 9 9 9 8 9' />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        label: 'Payments',
        href: '/dashboard/payments',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect width='20' height='14' x='2' y='5' rx='2' />
            <line x1='2' x2='22' y1='10' y2='10' />
          </svg>
        ),
      },
      {
        label: 'Expenses',
        href: '/dashboard/expenses',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <line x1='12' x2='12' y1='2' y2='22' />
            <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Maintenance',
        href: '/dashboard/maintenance',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Organization',
    items: [
      {
        label: 'Org Settings',
        href: '/dashboard/organization/settings',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
            <circle cx='12' cy='12' r='3' />
          </svg>
        ),
      },
      {
        label: 'Members',
        href: '/dashboard/organization/members',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
        ),
      },
    ],
  },
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
  isOrgAdmin,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  const canAccessOrg = isOrgAdmin || userRole === 'admin';

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

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
        <nav className='flex-1 px-3 py-4 overflow-y-auto space-y-1'>
          {NAV_SECTIONS.map((section, si) => {
            if (section.label === 'Organization' && !canAccessOrg) return null;
            return (
              <div key={si}>
                {section.label && si > 0 && (
                  <div className='border-t border-zinc-800 my-2' />
                )}
                {section.label && (
                  <p className='text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 pt-1 pb-1.5'>
                    {section.label}
                  </p>
                )}
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? 'bg-indigo-600/15 text-indigo-400 font-medium border-l-2 border-indigo-500 pl-[10px]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70 border-l-2 border-transparent pl-[10px]'
                      }`}
                    >
                      <span
                        className={active ? 'text-indigo-400' : 'text-zinc-500'}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div
          ref={userMenuRef}
          className='px-3 py-3 border-t border-zinc-800 relative'
        >
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className='flex items-center gap-3 w-full hover:bg-zinc-800 rounded-lg px-3 py-2 transition'
          >
            <div className='w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0'>
              {getInitials(userName)}
            </div>
            <div className='overflow-hidden text-left flex-1'>
              <p className='text-sm font-medium truncate'>{userName}</p>
              <p className='text-xs text-zinc-500 capitalize'>{userRole}</p>
            </div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`text-zinc-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
            >
              <polyline points='18 15 12 9 6 15' />
            </svg>
          </button>

          {userMenuOpen && (
            <div className='absolute bottom-full left-2 right-2 mb-2 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl'>
              <div className='px-4 py-3 border-b border-zinc-700'>
                <p className='text-xs text-zinc-500 truncate'>{userName}</p>
              </div>
              <Link
                href='/dashboard/profile'
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <circle cx='12' cy='8' r='4' />
                  <path d='M20 21a8 8 0 1 0-16 0' />
                </svg>
                Profile
              </Link>
              <Link
                href='/dashboard/profile'
                onClick={() => setUserMenuOpen(false)}
                className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
                  <circle cx='12' cy='12' r='3' />
                </svg>
                Settings
              </Link>
              <div className='border-t border-zinc-700' />
              <Link
                href='/api/auth/logout'
                className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 transition'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                  <polyline points='16 17 21 12 16 7' />
                  <line x1='21' x2='9' y1='12' y2='12' />
                </svg>
                Sign out
              </Link>
            </div>
          )}
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
        <header className='sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center gap-3 lg:hidden'>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className='text-zinc-400 hover:text-white transition'
          >
            ☰
          </button>
          <span className='text-sm font-semibold'>RentStack</span>
        </header>
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
