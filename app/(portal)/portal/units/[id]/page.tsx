// app/(portal)/portal/units/[id]/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import ApplyButton from './ApplyButton';

export default async function PortalUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  if (!unit) notFound();

  // Check if user already has a pending application
  const existingApplication = await prisma.leaseApplication.findFirst({
    where: { unit_id: id, user_id: session.userId, status: 'pending' },
  });

  const address = [
    unit.property.street,
    unit.property.barangay,
    unit.property.city,
    unit.property.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className='px-8 py-8 max-w-3xl mx-auto'>
      {/* Images */}
      <div className='rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-6 h-64 relative'>
        {unit.images[0] ? (
          <Image
            src={unit.images[0].url}
            alt={`Unit ${unit.unit_number}`}
            fill
            className='object-cover'
          />
        ) : (
          <div className='h-full flex items-center justify-center text-zinc-600'>
            No photos
          </div>
        )}
      </div>

      {/* Header */}
      <div className='flex items-start justify-between mb-6'>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-widest'>
            {unit.property.property_type}
          </p>
          <h1 className='text-2xl font-bold mt-0.5'>
            {unit.property.name} — Unit {unit.unit_number}
          </h1>
          <p className='text-zinc-500 text-sm mt-1'>{address}</p>
        </div>
        <div className='text-right shrink-0'>
          <p className='text-indigo-400 font-bold text-xl'>
            ₱{Number(unit.rent_amount).toLocaleString()}/mo
          </p>
          <span
            className={`text-xs px-2.5 py-1 rounded-full border capitalize ${
              unit.status === 'available'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : unit.status === 'occupied'
                  ? 'text-zinc-500 bg-zinc-800 border-zinc-700'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {unit.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6'>
        <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4'>
          Details
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-center'>
          {[
            { label: 'Bedrooms', value: unit.bedrooms },
            { label: 'Bathrooms', value: unit.bathrooms },
            { label: 'Floor', value: unit.floor ?? '—' },
            {
              label: 'Type',
              value:
                unit.property.property_type.charAt(0).toUpperCase() +
                unit.property.property_type.slice(1),
            },
          ].map(({ label, value }) => (
            <div key={label} className='bg-zinc-800 rounded-xl p-3'>
              <p className='text-lg font-bold text-white'>{value}</p>
              <p className='text-xs text-zinc-500 mt-0.5'>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply */}
      {unit.status === 'available' && (
        <ApplyButton unitId={unit.id} hasExisting={!!existingApplication} />
      )}
    </div>
  );
}
