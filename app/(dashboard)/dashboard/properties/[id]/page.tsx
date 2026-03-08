// app/(dashboard)/dashboard/properties/[id]/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  available: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  occupied: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  maintenance: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const property = await prisma.property.findFirst({
    where: {
      id,
      organization_id: session.organizationId,
    },
    include: {
      units: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          leases: {
            where: { status: 'active' },
            include: { tenant: true },
            take: 1,
          },
        },
        orderBy: { unit_number: 'asc' },
      },
    },
  });

  if (!property) notFound();

  const total = property.units.length;
  const occupied = property.units.filter((u) => u.status === 'occupied').length;
  const available = property.units.filter(
    (u) => u.status === 'available',
  ).length;
  const maintenance = property.units.filter(
    (u) => u.status === 'maintenance',
  ).length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const monthlyRevenue = property.units
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + Number(u.rent_amount), 0);

  const address = [
    property.street,
    property.barangay,
    property.city,
    property.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link
          href='/dashboard/properties'
          className='hover:text-white transition'
        >
          Properties
        </Link>
        <span>/</span>
        <span className='text-white'>{property.name}</span>
      </div>

      {/* Header */}
      <div className='flex items-start justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-1'>
            <h1 className='text-2xl font-bold'>{property.name}</h1>
            <span className='text-xs uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full'>
              {property.property_type}
            </span>
          </div>
          {address && <p className='text-zinc-500 text-sm'>{address}</p>}
        </div>
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/properties/${property.id}/units/new`}
            className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
          >
            + Add Unit
          </Link>
          <Link
            href={`/dashboard/properties/${property.id}/edit`}
            className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm px-4 py-2.5 rounded-lg transition'
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
        {[
          { label: 'Total Units', value: total, accent: 'zinc' },
          { label: 'Available', value: available, accent: 'emerald' },
          { label: 'Occupied', value: occupied, accent: 'indigo' },
          {
            label: 'Monthly Revenue',
            value: `₱${monthlyRevenue.toLocaleString()}`,
            accent: 'violet',
          },
        ].map((s) => (
          <div
            key={s.label}
            className='bg-zinc-900 border border-zinc-800 rounded-xl p-4'
          >
            <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
              {s.label}
            </p>
            <p
              className={`text-xl font-bold ${
                s.accent === 'emerald'
                  ? 'text-emerald-400'
                  : s.accent === 'indigo'
                    ? 'text-indigo-400'
                    : s.accent === 'violet'
                      ? 'text-violet-400'
                      : 'text-white'
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      {total > 0 && (
        <div className='mb-8'>
          <div className='flex justify-between text-xs text-zinc-500 mb-1.5'>
            <span>Occupancy rate</span>
            <span>{occupancyRate}%</span>
          </div>
          <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-indigo-500 rounded-full transition-all'
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className='flex gap-4 mt-2 text-xs text-zinc-600'>
            <span className='text-emerald-400'>{available} available</span>
            <span className='text-indigo-400'>{occupied} occupied</span>
            {maintenance > 0 && (
              <span className='text-amber-400'>{maintenance} maintenance</span>
            )}
          </div>
        </div>
      )}

      {/* Units */}
      <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
        Units
      </h2>

      {property.units.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-12 text-center'>
          <p className='text-2xl mb-3'>🚪</p>
          <h3 className='text-base font-semibold mb-2'>No units yet</h3>
          <p className='text-zinc-500 text-sm mb-5'>
            Add units to start accepting tenants.
          </p>
          <Link
            href={`/dashboard/properties/${property.id}/units/new`}
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-lg transition'
          >
            + Add Unit
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {property.units.map((unit) => {
            const activeLease = unit.leases[0];
            const tenant = activeLease?.tenant;

            return (
              <Link
                key={unit.id}
                href={`/dashboard/units/${unit.id}`}
                className='bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition group block'
              >
                {/* Unit header */}
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <p className='text-white font-semibold'>
                      Unit {unit.unit_number}
                    </p>
                    {unit.floor && (
                      <p className='text-xs text-zinc-500'>
                        Floor {unit.floor}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[unit.status]}`}
                  >
                    {unit.status}
                  </span>
                </div>

                {/* Details */}
                <div className='flex gap-3 text-zinc-400 text-sm mb-3'>
                  <span>🛏 {unit.bedrooms}</span>
                  <span>🚿 {unit.bathrooms}</span>
                </div>

                {/* Tenant or available */}
                {tenant ? (
                  <p className='text-xs text-zinc-500 mb-3'>
                    👤 {tenant.first_name} {tenant.last_name}
                  </p>
                ) : (
                  <p className='text-xs text-zinc-600 mb-3'>No active tenant</p>
                )}

                {/* Rent */}
                <div className='flex items-center justify-between pt-3 border-t border-zinc-800'>
                  <span className='text-indigo-400 font-bold text-sm'>
                    ₱{Number(unit.rent_amount).toLocaleString()}/mo
                  </span>
                  <span className='text-xs text-zinc-600 group-hover:text-zinc-400 transition'>
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
