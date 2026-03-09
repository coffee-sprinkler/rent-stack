// app/(portal)/portal/applications/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  rejected: 'text-zinc-500 bg-zinc-800 border-zinc-700',
};

export default async function MyApplicationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const applications = await prisma.leaseApplication.findMany({
    where: { user_id: session.userId },
    include: {
      unit: { include: { property: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className='px-8 py-8 max-w-3xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>My Applications</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {applications.length} application
          {applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>📬</p>
          <h3 className='text-lg font-semibold mb-2'>No applications yet</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            Browse available units and apply for one you like.
          </p>
          <a
            href='/portal'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            Browse Units
          </a>
        </div>
      ) : (
        <div className='space-y-3'>
          {applications.map((a) => (
            <div
              key={a.id}
              className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'
            >
              <div className='flex items-start justify-between gap-3 mb-2'>
                <div>
                  <p className='font-medium text-white'>
                    {a.unit.property.name} — Unit {a.unit.unit_number}
                  </p>
                  <p className='text-xs text-zinc-500'>
                    {a.unit.property.city ?? ''} · ₱
                    {Number(a.unit.rent_amount).toLocaleString()}/mo
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border capitalize shrink-0 ${STATUS_STYLES[a.status]}`}
                >
                  {a.status}
                </span>
              </div>
              {a.message && (
                <p className='text-sm text-zinc-500 italic mt-2'>
                  &quot;{a.message}&quot;
                </p>
              )}
              <p className='text-xs text-zinc-600 mt-3'>
                Applied{' '}
                {new Date(a.created_at).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
