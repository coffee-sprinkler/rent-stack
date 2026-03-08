// app/(dashboard)/dashboard/leases/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LeasesPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const leases = await prisma.lease.findMany({
    where: { unit: { property: { organization_id: session.organizationId } } },
    include: {
      tenant: true,
      unit: { include: { property: true } },
    },
    orderBy: { start_date: 'desc' },
  });

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold'>Leases</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            {leases.length} lease{leases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href='/dashboard/leases/new'
          className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
        >
          + New Lease
        </Link>
      </div>

      {leases.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>📄</p>
          <h3 className='text-lg font-semibold mb-2'>No leases yet</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            Create a lease to link a tenant to a unit.
          </p>
          <Link
            href='/dashboard/leases/new'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            + New Lease
          </Link>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Tenant
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Period
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Rent
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Status
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody>
              {leases.map((lease) => (
                <tr
                  key={lease.id}
                  className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='font-medium text-white'>
                      {lease.tenant.first_name} {lease.tenant.last_name}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {lease.tenant.email}
                    </p>
                  </td>
                  <td className='px-6 py-4 hidden sm:table-cell'>
                    <p className='text-white'>Unit {lease.unit.unit_number}</p>
                    <p className='text-xs text-zinc-500'>
                      {lease.unit.property.name}
                    </p>
                  </td>
                  <td className='px-6 py-4 hidden lg:table-cell text-zinc-400'>
                    {new Date(lease.start_date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' → '}
                    {new Date(lease.end_date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className='px-6 py-4 text-indigo-400 font-medium'>
                    ₱{Number(lease.monthly_rent).toLocaleString()}/mo
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${lease.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-zinc-500 bg-zinc-800 border-zinc-700'}`}
                    >
                      {lease.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      href={`/dashboard/leases/${lease.id}`}
                      className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
