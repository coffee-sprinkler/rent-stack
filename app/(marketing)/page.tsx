import Link from 'next/link';
import { prisma } from '@/db/prisma';

async function getAvailableUnits() {
  return prisma.unit.findMany({
    where: { status: 'available' },
    include: { property: true },
    orderBy: { rent_amount: 'asc' },
  });
}

export default async function HomePage() {
  const units = await getAvailableUnits();

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      {/* Nav */}
      <nav className='border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto'>
        <span className='text-xl font-bold tracking-tight'>RentStack</span>
        <div className='flex items-center gap-4'>
          <Link
            href='/login'
            className='text-sm text-zinc-400 hover:text-white transition'
          >
            Sign in
          </Link>
          <Link
            href='/register'
            className='text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition'
          >
            List your property
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className='max-w-7xl mx-auto px-6 py-20 text-center'>
        <p className='text-indigo-400 text-sm font-medium tracking-widest uppercase mb-4'>
          Find your next home
        </p>
        <h1 className='text-5xl font-bold tracking-tight leading-tight mb-6'>
          Available Units
        </h1>
        <p className='text-zinc-400 text-lg max-w-xl mx-auto'>
          Browse verified rental units. No signup needed to look around.
        </p>
      </section>

      {/* Units Grid */}
      <section className='max-w-7xl mx-auto px-6 pb-24'>
        {units.length === 0 ? (
          <div className='text-center py-24 text-zinc-600'>
            <p className='text-lg'>No units available right now.</p>
            <p className='text-sm mt-2'>Check back soon.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {units.map((unit) => (
              <div
                key={unit.id}
                className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition group'
              >
                {/* Image placeholder */}
                <div className='h-48 bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition'>
                  <span className='text-zinc-600 text-sm'>
                    Unit {unit.unit_number}
                  </span>
                </div>

                {/* Info */}
                <div className='p-5 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-xs text-zinc-500 uppercase tracking-widest'>
                        {unit.property.property_type}
                      </p>
                      <h3 className='text-white font-semibold mt-0.5'>
                        {unit.property.name} — Unit {unit.unit_number}
                      </h3>
                    </div>
                    <span className='text-indigo-400 font-bold text-sm whitespace-nowrap'>
                      ₱{Number(unit.rent_amount).toLocaleString()}/mo
                    </span>
                  </div>

                  <p className='text-zinc-500 text-xs'>
                    {unit.property.address}
                  </p>

                  <div className='flex items-center gap-4 text-zinc-400 text-sm pt-1'>
                    <span>🛏 {unit.bedrooms} bed</span>
                    <span>🚿 {unit.bathrooms} bath</span>
                    <span>Floor {unit.floor}</span>
                  </div>

                  <button className='w-full mt-2 border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 text-zinc-300 text-sm rounded-lg py-2 transition'>
                    Contact to apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-800 px-6 py-8 text-center text-zinc-600 text-sm'>
        © {new Date().getFullYear()} RentStack. All rights reserved.
      </footer>
    </div>
  );
}
