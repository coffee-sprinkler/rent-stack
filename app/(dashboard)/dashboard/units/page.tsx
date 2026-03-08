// app/(dashboard)/dashboard/units/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  available: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  occupied: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  maintenance: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default async function UnitsPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const units = await prisma.unit.findMany({
    where: { property: { organization_id: session.organizationId } },
    include: {
      property: true,
      leases: {
        where: { status: 'active' },
        include: { tenant: true },
        take: 1,
      },
    },
    orderBy: [{ property: { name: 'asc' } }, { unit_number: 'asc' }],
  });

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Units</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {units.length} unit{units.length !== 1 ? 's' : ''} across all
          properties
        </p>
      </div>

      {units.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>🚪</p>
          <h3 className='text-lg font-semibold mb-2'>No units yet</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            Add a property first, then add units to it.
          </p>
          <Link
            href='/dashboard/properties/new'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            + Add Property
          </Link>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
                  Property
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Details
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Tenant
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
              {units.map((unit) => {
                const tenant = unit.leases[0]?.tenant;
                return (
                  <tr
                    key={unit.id}
                    className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                  >
                    <td className='px-6 py-4'>
                      <p className='font-medium text-white'>
                        Unit {unit.unit_number}
                      </p>
                      {unit.floor && (
                        <p className='text-xs text-zinc-500'>
                          Floor {unit.floor}
                        </p>
                      )}
                    </td>
                    <td className='px-6 py-4 hidden sm:table-cell'>
                      <Link
                        href={`/dashboard/properties/${unit.property_id}`}
                        className='text-white hover:text-indigo-400 transition'
                      >
                        {unit.property.name}
                      </Link>
                    </td>
                    <td className='px-6 py-4 hidden lg:table-cell text-zinc-400'>
                      {unit.bedrooms} bed · {unit.bathrooms} bath
                    </td>
                    <td className='px-6 py-4'>
                      {tenant ? (
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className='text-white hover:text-indigo-400 transition'
                        >
                          {tenant.first_name} {tenant.last_name}
                        </Link>
                      ) : (
                        <span className='text-zinc-600'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-indigo-400 font-medium'>
                      ₱{Number(unit.rent_amount).toLocaleString()}/mo
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[unit.status]}`}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <Link
                        href={`/dashboard/units/${unit.id}`}
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
