// app/(dashboard)/dashboard/tenants/[id]/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const tenant = await prisma.tenant.findFirst({
    where: { id, organization_id: session.organizationId },
    include: {
      leases: {
        include: {
          unit: { include: { property: true } },
          payments: { orderBy: { due_date: 'desc' }, take: 6 },
        },
        orderBy: { start_date: 'desc' },
      },
      maintenance_requests: {
        include: { unit: { include: { property: true } } },
        orderBy: { status: 'asc' },
        take: 5,
      },
    },
  });

  if (!tenant) notFound();

  const activeLease = tenant.leases.find((l) => l.status === 'active');

  return (
    <div className='px-8 py-8 max-w-5xl mx-auto'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/tenants' className='hover:text-white transition'>
          Tenants
        </Link>
        <span>/</span>
        <span className='text-white'>
          {tenant.first_name} {tenant.last_name}
        </span>
      </div>

      {/* Header */}
      <div className='flex items-start justify-between mb-8'>
        <div className='flex items-center gap-4'>
          <div className='w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400'>
            {tenant.first_name[0]}
            {tenant.last_name[0]}
          </div>
          <div>
            <h1 className='text-2xl font-bold'>
              {tenant.first_name} {tenant.last_name}
            </h1>
            <p className='text-zinc-500 text-sm'>{tenant.email}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/tenants/${id}/edit`}
            className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm px-4 py-2.5 rounded-lg transition'
          >
            Edit
          </Link>
          {!activeLease && (
            <Link
              href={`/dashboard/leases/new?tenantId=${id}`}
              className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
            >
              + Assign Lease
            </Link>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          {/* Active lease */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Active Lease
            </h2>
            {activeLease ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between pb-3 border-b border-zinc-800'>
                  <div>
                    <p className='text-white font-medium'>
                      Unit {activeLease.unit.unit_number}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {activeLease.unit.property.name}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/units/${activeLease.unit.id}`}
                    className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                  >
                    View unit →
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
                  href={`/dashboard/leases/new?tenantId=${id}`}
                  className='inline-block mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition'
                >
                  + Assign a lease
                </Link>
              </div>
            )}
          </div>

          {/* Recent payments */}
          {activeLease && (
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
              <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
                Recent Payments
              </h2>
              {activeLease.payments.length === 0 ? (
                <p className='text-zinc-600 text-sm text-center py-6'>
                  No payments recorded
                </p>
              ) : (
                <div className='space-y-2'>
                  {activeLease.payments.map((p) => (
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
                        className={`text-xs px-2.5 py-1 rounded-full border capitalize ${
                          p.status === 'paid'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : p.status === 'late'
                              ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className='space-y-6'>
          {/* Contact info */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Contact
            </h2>
            <div className='space-y-2'>
              {[
                { label: 'Email', value: tenant.email },
                { label: 'Phone', value: tenant.phone ?? '—' },
                { label: 'Emergency', value: tenant.emergency_contact ?? '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className='flex justify-between text-sm py-1.5 border-b border-zinc-800 last:border-0'
                >
                  <span className='text-zinc-500'>{label}</span>
                  <span className='text-white text-right max-w-[180px] truncate'>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Maintenance
            </h2>
            {tenant.maintenance_requests.length === 0 ? (
              <p className='text-zinc-600 text-sm text-center py-4'>
                No requests
              </p>
            ) : (
              <div className='space-y-2'>
                {tenant.maintenance_requests.map((r) => (
                  <div
                    key={r.id}
                    className='py-2.5 border-b border-zinc-800 last:border-0'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <p className='text-sm text-white truncate'>{r.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                          r.status === 'resolved'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : r.status === 'in_progress'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}
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
