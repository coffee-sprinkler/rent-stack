// app/(dashboard)/dashboard/properties/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PropertiesPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const properties = await prisma.property.findMany({
    where: { organization_id: session.organizationId },
    include: { units: { select: { status: true } } },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold'>Properties</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}{' '}
            in your portfolio
          </p>
        </div>
        <Link
          href='/dashboard/properties/new'
          className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
        >
          + Add Property
        </Link>
      </div>

      {/* Content */}
      {properties.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
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
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {properties.map((property) => {
            const total = property.units.length;
            const occupied = property.units.filter(
              (u) => u.status === 'occupied',
            ).length;
            const available = property.units.filter(
              (u) => u.status === 'available',
            ).length;
            const maintenance = property.units.filter(
              (u) => u.status === 'maintenance',
            ).length;
            const occupancyRate =
              total > 0 ? Math.round((occupied / total) * 100) : 0;

            return (
              <Link
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
                className='bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition group block'
              >
                <div className='flex items-start justify-between mb-4'>
                  <span className='text-xs uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full'>
                    {property.property_type}
                  </span>
                  <span className='text-xs text-zinc-500'>
                    {total} unit{total !== 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className='text-white font-semibold text-lg group-hover:text-indigo-400 transition mb-1'>
                  {property.name}
                </h3>

                <p className='text-zinc-500 text-sm mb-5'>
                  {[property.barangay, property.city, property.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>

                <div className='flex gap-3 text-xs mb-4'>
                  <span className='text-emerald-400'>
                    {available} available
                  </span>
                  <span className='text-zinc-600'>·</span>
                  <span className='text-indigo-400'>{occupied} occupied</span>
                  {maintenance > 0 && (
                    <>
                      <span className='text-zinc-600'>·</span>
                      <span className='text-amber-400'>
                        {maintenance} maintenance
                      </span>
                    </>
                  )}
                </div>

                {total > 0 && (
                  <div>
                    <div className='flex justify-between text-xs text-zinc-500 mb-1.5'>
                      <span>Occupancy</span>
                      <span>{occupancyRate}%</span>
                    </div>
                    <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-indigo-500 rounded-full transition-all'
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
