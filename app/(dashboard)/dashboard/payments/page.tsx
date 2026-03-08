// app/(dashboard)/dashboard/payments/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  late: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');

  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: { property: { organization_id: session.organizationId } },
      },
    },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: { include: { property: true } },
        },
      },
    },
    orderBy: { due_date: 'desc' },
  });

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalLate = payments
    .filter((p) => p.status === 'late')
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Payments</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {payments.length} payment record{payments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-3 gap-4 mb-8'>
        {[
          {
            label: 'Collected',
            value: totalCollected,
            style: 'text-emerald-400',
          },
          { label: 'Pending', value: totalPending, style: 'text-amber-400' },
          { label: 'Late', value: totalLate, style: 'text-rose-400' },
        ].map((s) => (
          <div
            key={s.label}
            className='bg-zinc-900 border border-zinc-800 rounded-xl p-4'
          >
            <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
              {s.label}
            </p>
            <p className={`text-xl font-bold ${s.style}`}>
              ₱{s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>💳</p>
          <h3 className='text-lg font-semibold mb-2'>No payments yet</h3>
          <p className='text-zinc-500 text-sm'>
            Payments appear here once leases are created.
          </p>
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
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Amount
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Due Date
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='font-medium text-white'>
                      {p.lease.tenant.first_name} {p.lease.tenant.last_name}
                    </p>
                  </td>
                  <td className='px-6 py-4 hidden sm:table-cell'>
                    <p className='text-white'>
                      Unit {p.lease.unit.unit_number}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {p.lease.unit.property.name}
                    </p>
                  </td>
                  <td className='px-6 py-4 text-white font-medium'>
                    ₱{Number(p.amount).toLocaleString()}
                  </td>
                  <td className='px-6 py-4 text-zinc-400 hidden lg:table-cell'>
                    {new Date(p.due_date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${PAYMENT_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
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
