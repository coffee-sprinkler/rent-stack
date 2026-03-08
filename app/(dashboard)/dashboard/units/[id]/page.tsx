// app/(dashboard)/dashboard/units/[id]/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  available: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  occupied: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  maintenance: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  late: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const MAINTENANCE_STYLES: Record<string, string> = {
  open: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const unit = await prisma.unit.findFirst({
    where: {
      id,
      property: { organization_id: session.organizationId },
    },
    include: {
      property: true,
      images: { orderBy: { order: 'asc' } },
      leases: {
        include: {
          tenant: true,
          payments: {
            orderBy: { due_date: 'desc' },
            take: 6,
          },
        },
        orderBy: { start_date: 'desc' },
        take: 1,
      },
      maintenance_requests: {
        orderBy: { status: 'asc' },
        take: 5,
      },
    },
  });

  if (!unit) notFound();

  const activeLease = unit.leases[0];
  const tenant = activeLease?.tenant;
  const payments = activeLease?.payments ?? [];

  return (
    <div className='px-8 py-8 max-w-5xl mx-auto'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link
          href='/dashboard/properties'
          className='hover:text-white transition'
        >
          Properties
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/properties/${unit.property_id}`}
          className='hover:text-white transition'
        >
          {unit.property.name}
        </Link>
        <span>/</span>
        <span className='text-white'>Unit {unit.unit_number}</span>
      </div>

      {/* Header */}
      <div className='flex items-start justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-1'>
            <h1 className='text-2xl font-bold'>Unit {unit.unit_number}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[unit.status]}`}
            >
              {unit.status}
            </span>
          </div>
          <p className='text-zinc-500 text-sm'>
            {unit.property.name}
            {unit.floor ? ` · Floor ${unit.floor}` : ''}
            {' · '}
            {unit.bedrooms} bed · {unit.bathrooms} bath
          </p>
        </div>
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/units/${id}/edit`}
            className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm px-4 py-2.5 rounded-lg transition'
          >
            Edit
          </Link>
          {!activeLease && (
            <Link
              href={`/dashboard/leases/new?unitId=${id}`}
              className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
            >
              + Assign Tenant
            </Link>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left col — lease + payments */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Active lease */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Active Lease
            </h2>
            {activeLease && tenant ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-3 pb-4 border-b border-zinc-800'>
                  <div className='w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400'>
                    {tenant.first_name[0]}
                    {tenant.last_name[0]}
                  </div>
                  <div>
                    <p className='font-medium text-white'>
                      {tenant.first_name} {tenant.last_name}
                    </p>
                    <p className='text-xs text-zinc-500'>{tenant.email}</p>
                  </div>
                  <Link
                    href={`/dashboard/tenants/${tenant.id}`}
                    className='ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition'
                  >
                    View →
                  </Link>
                </div>
                {[
                  {
                    label: 'Monthly Rent',
                    value: `₱${Number(activeLease.monthly_rent).toLocaleString()}`,
                  },
                  {
                    label: 'Deposit',
                    value: `₱${Number(activeLease.deposit_amount).toLocaleString()}`,
                  },
                  {
                    label: 'Start Date',
                    value: new Date(activeLease.start_date).toLocaleDateString(
                      'en-PH',
                      { year: 'numeric', month: 'long', day: 'numeric' },
                    ),
                  },
                  {
                    label: 'End Date',
                    value: new Date(activeLease.end_date).toLocaleDateString(
                      'en-PH',
                      { year: 'numeric', month: 'long', day: 'numeric' },
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='flex justify-between text-sm py-1.5'
                  >
                    <span className='text-zinc-500'>{label}</span>
                    <span className='text-white font-medium'>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-zinc-600 text-sm'>No active lease</p>
                <Link
                  href={`/dashboard/leases/new?unitId=${id}`}
                  className='inline-block mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition'
                >
                  + Assign a tenant
                </Link>
              </div>
            )}
          </div>

          {/* Payments */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Recent Payments
            </h2>
            {payments.length === 0 ? (
              <p className='text-zinc-600 text-sm text-center py-6'>
                No payments recorded
              </p>
            ) : (
              <div className='space-y-2'>
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className='flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0'
                  >
                    <div>
                      <p className='text-sm text-white'>
                        ₱{Number(p.amount).toLocaleString()}
                      </p>
                      <p className='text-xs text-zinc-500'>
                        Due{' '}
                        {new Date(p.due_date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${PAYMENT_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — unit info + maintenance */}
        <div className='space-y-6'>
          {/* Unit info */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Unit Info
            </h2>
            <div className='space-y-2'>
              {[
                {
                  label: 'Rent',
                  value: `₱${Number(unit.rent_amount).toLocaleString()}/mo`,
                },
                { label: 'Bedrooms', value: unit.bedrooms },
                { label: 'Bathrooms', value: unit.bathrooms },
                { label: 'Floor', value: unit.floor ?? '—' },
                { label: 'Status', value: unit.status },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className='flex justify-between text-sm py-1.5 border-b border-zinc-800 last:border-0'
                >
                  <span className='text-zinc-500'>{label}</span>
                  <span className='text-white capitalize'>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest'>
                Maintenance
              </h2>
              <Link
                href={`/dashboard/maintenance?unitId=${id}`}
                className='text-xs text-indigo-400 hover:text-indigo-300 transition'
              >
                View all
              </Link>
            </div>
            {unit.maintenance_requests.length === 0 ? (
              <p className='text-zinc-600 text-sm text-center py-4'>
                No requests
              </p>
            ) : (
              <div className='space-y-2'>
                {unit.maintenance_requests.map((r) => (
                  <div
                    key={r.id}
                    className='py-2.5 border-b border-zinc-800 last:border-0'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <p className='text-sm text-white truncate'>{r.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${MAINTENANCE_STYLES[r.status]}`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className='text-xs text-zinc-600 mt-0.5 capitalize'>
                      {r.priority} priority
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
