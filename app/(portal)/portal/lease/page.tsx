// app/(portal)/portal/lease/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MyLeasePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Find tenant record linked to this user's email
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, name: true },
  });

  const tenant = user
    ? await prisma.tenant.findFirst({
        where: { email: user.email },
        include: {
          leases: {
            where: { status: 'active' },
            include: {
              unit: { include: { property: true } },
              payments: { orderBy: { due_date: 'desc' }, take: 3 },
            },
            take: 1,
          },
        },
      })
    : null;

  const lease = tenant?.leases[0];
  const unit = lease?.unit;
  const property = unit?.property;

  return (
    <div className='px-8 py-8 max-w-3xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>My Lease</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Your current rental agreement
        </p>
      </div>

      {!lease ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>📄</p>
          <h3 className='text-lg font-semibold mb-2'>No active lease</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            You don&apos;t have an active lease yet. Browse available units to
            find your next home.
          </p>
          <Link
            href='/portal'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            Browse Units
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Unit info */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Unit
            </h2>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-white font-semibold text-lg'>
                  Unit {unit!.unit_number}
                </p>
                <p className='text-zinc-500 text-sm'>{property!.name}</p>
                <p className='text-zinc-600 text-xs mt-0.5'>
                  {[
                    property!.street,
                    property!.barangay,
                    property!.city,
                    property!.province,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-indigo-400 font-bold text-lg'>
                  ₱{Number(unit!.rent_amount).toLocaleString()}/mo
                </p>
                <p className='text-xs text-zinc-500'>
                  {unit!.bedrooms} bed · {unit!.bathrooms} bath
                </p>
              </div>
            </div>
          </div>

          {/* Lease details */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
              Lease Details
            </h2>
            <div className='space-y-0'>
              {[
                {
                  label: 'Monthly Rent',
                  value: `₱${Number(lease.monthly_rent).toLocaleString()}`,
                },
                {
                  label: 'Security Deposit',
                  value: `₱${Number(lease.deposit_amount).toLocaleString()}`,
                },
                {
                  label: 'Start Date',
                  value: new Date(lease.start_date).toLocaleDateString(
                    'en-PH',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  ),
                },
                {
                  label: 'End Date',
                  value: new Date(lease.end_date).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                },
                { label: 'Status', value: lease.status },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className='flex justify-between text-sm py-3 border-b border-zinc-800 last:border-0'
                >
                  <span className='text-zinc-500'>{label}</span>
                  <span className='text-white font-medium capitalize'>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent payments */}
          <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest'>
                Recent Payments
              </h2>
              <Link
                href='/portal/payments'
                className='text-xs text-indigo-400 hover:text-indigo-300 transition'
              >
                View all →
              </Link>
            </div>
            {lease.payments.length === 0 ? (
              <p className='text-zinc-600 text-sm text-center py-4'>
                No payments recorded
              </p>
            ) : (
              <div className='space-y-0'>
                {lease.payments.map((p) => (
                  <div
                    key={p.id}
                    className='flex items-center justify-between py-3 border-b border-zinc-800 last:border-0'
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
        </div>
      )}
    </div>
  );
}
