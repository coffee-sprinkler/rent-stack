// app/(dashboard)/dashboard/tenants/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TenantsPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const tenants = await prisma.tenant.findMany({
    where: { organization_id: session.organizationId },
    include: {
      leases: {
        where: { status: 'active' },
        include: { unit: { include: { property: true } } },
        take: 1,
      },
    },
    orderBy: { last_name: 'asc' },
  });

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold'>Tenants</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} in your
            portfolio
          </p>
        </div>
        <Link
          href='/dashboard/tenants/new'
          className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
        >
          + Add Tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>👥</p>
          <h3 className='text-lg font-semibold mb-2'>No tenants yet</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            Add tenants to assign them to units.
          </p>
          <Link
            href='/dashboard/tenants/new'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            + Add your first tenant
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
                  Contact
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Status
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => {
                const lease = tenant.leases[0];
                const unit = lease?.unit;
                return (
                  <tr
                    key={tenant.id}
                    className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0'>
                          {tenant.first_name[0]}
                          {tenant.last_name[0]}
                        </div>
                        <div>
                          <p className='font-medium text-white'>
                            {tenant.first_name} {tenant.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-zinc-400 hidden sm:table-cell'>
                      <p>{tenant.email}</p>
                      {tenant.phone && (
                        <p className='text-xs text-zinc-600'>{tenant.phone}</p>
                      )}
                    </td>
                    <td className='px-6 py-4 hidden lg:table-cell'>
                      {unit ? (
                        <div>
                          <p className='text-white'>Unit {unit.unit_number}</p>
                          <p className='text-xs text-zinc-500'>
                            {unit.property.name}
                          </p>
                        </div>
                      ) : (
                        <span className='text-zinc-600'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${lease ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-zinc-500 bg-zinc-800 border-zinc-700'}`}
                      >
                        {lease ? 'Active lease' : 'No lease'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <Link
                        href={`/dashboard/tenants/${tenant.id}`}
                        className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
