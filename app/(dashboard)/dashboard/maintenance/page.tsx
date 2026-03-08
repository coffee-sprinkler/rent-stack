// app/(dashboard)/dashboard/maintenance/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  open: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default async function MaintenancePage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const requests = await prisma.maintenanceRequest.findMany({
    where: { unit: { property: { organization_id: session.organizationId } } },
    include: {
      unit: { include: { property: true } },
      tenant: true,
    },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }],
  });

  const open = requests.filter((r) => r.status === 'open').length;
  const inProgress = requests.filter((r) => r.status === 'in_progress').length;
  const resolved = requests.filter((r) => r.status === 'resolved').length;

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Maintenance</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-3 gap-4 mb-8'>
        {[
          { label: 'Open', value: open, style: 'text-rose-400' },
          { label: 'In Progress', value: inProgress, style: 'text-amber-400' },
          { label: 'Resolved', value: resolved, style: 'text-emerald-400' },
        ].map((s) => (
          <div
            key={s.label}
            className='bg-zinc-900 border border-zinc-800 rounded-xl p-4'
          >
            <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
              {s.label}
            </p>
            <p className={`text-xl font-bold ${s.style}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>🔧</p>
          <h3 className='text-lg font-semibold mb-2'>
            No maintenance requests
          </h3>
          <p className='text-zinc-500 text-sm'>
            Requests submitted by tenants will appear here.
          </p>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Request
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
                  Tenant
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Priority
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Status
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='font-medium text-white'>{r.title}</p>
                    <p className='text-xs text-zinc-500 mt-0.5 line-clamp-1'>
                      {r.description}
                    </p>
                  </td>
                  <td className='px-6 py-4 hidden sm:table-cell'>
                    <p className='text-white'>
                      {r.tenant.first_name} {r.tenant.last_name}
                    </p>
                  </td>
                  <td className='px-6 py-4 hidden lg:table-cell'>
                    <p className='text-white'>Unit {r.unit.unit_number}</p>
                    <p className='text-xs text-zinc-500'>
                      {r.unit.property.name}
                    </p>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${PRIORITY_STYLES[r.priority]}`}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      href={`/dashboard/maintenance/${r.id}`}
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
