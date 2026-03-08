// app/(dashboard)/dashboard/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const orgId = session.organizationId;

  const [properties, units, tenants, payments] = await Promise.all([
    prisma.property.count({ where: { organization_id: orgId } }),
    prisma.unit.findMany({
      where: { property: { organization_id: orgId } },
      select: { status: true },
    }),
    prisma.tenant.count({ where: { organization_id: orgId } }),
    prisma.payment.findMany({
      where: {
        lease: { unit: { property: { organization_id: orgId } } },
        status: 'pending',
      },
      select: { amount: true },
    }),
  ]);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const pendingRent = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const statCards = [
    {
      label: 'Properties',
      value: properties,
      sub: 'total listed',
      accent: 'indigo',
    },
    {
      label: 'Total Units',
      value: totalUnits,
      sub: `${availableUnits} available`,
      accent: 'violet',
    },
    {
      label: 'Occupancy',
      value: `${occupancyRate}%`,
      sub: `${occupiedUnits} of ${totalUnits} occupied`,
      accent: occupancyRate >= 80 ? 'emerald' : 'amber',
    },
    { label: 'Tenants', value: tenants, sub: 'active renters', accent: 'sky' },
    {
      label: 'Pending Rent',
      value: `₱${pendingRent.toLocaleString()}`,
      sub: 'awaiting payment',
      accent: pendingRent > 0 ? 'rose' : 'emerald',
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
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      {/* Welcome */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>
          Welcome back, {session.name?.split(' ')[0]} 👋
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
            { label: 'Add Tenant', href: '/dashboard/tenants/new', icon: '👤' },
            { label: 'New Lease', href: '/dashboard/leases/new', icon: '📄' },
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

      {/* Empty state */}
      {properties === 0 && (
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
    </div>
  );
}
