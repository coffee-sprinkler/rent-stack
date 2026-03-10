'use client';
// app/(dashboard)/dashboard/payments/PaymentsClient.tsx

import { useState, useTransition } from 'react';
import { markPaymentAsPaid } from '@/app/actions/payments';

type Payment = {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  lease: {
    tenant: { first_name: string; last_name: string };
    unit: { unit_number: string; property: { name: string } };
  };
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  late: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

function PaymentRow({ payment }: { payment: Payment }) {
  const [status, setStatus] = useState(payment.status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleMarkPaid() {
    startTransition(async () => {
      try {
        await markPaymentAsPaid(payment.id);
        setStatus('paid');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <tr className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'>
      <td className='px-6 py-4'>
        <p className='font-medium text-white'>
          {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
        </p>
      </td>
      <td className='px-6 py-4 hidden sm:table-cell'>
        <p className='text-white'>Unit {payment.lease.unit.unit_number}</p>
        <p className='text-xs text-zinc-500'>
          {payment.lease.unit.property.name}
        </p>
      </td>
      <td className='px-6 py-4 text-white font-medium'>
        ₱{payment.amount.toLocaleString()}
      </td>
      <td className='px-6 py-4 text-zinc-400 hidden lg:table-cell'>
        {new Date(payment.due_date).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
      <td className='px-6 py-4 hidden lg:table-cell text-zinc-400 text-sm'>
        {payment.paid_date
          ? new Date(payment.paid_date).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—'}
      </td>
      <td className='px-6 py-4'>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border capitalize ${PAYMENT_STYLES[status]}`}
        >
          {status}
        </span>
      </td>
      <td className='px-6 py-4 text-right'>
        {status !== 'paid' && (
          <div className='flex flex-col items-end gap-1'>
            <button
              onClick={handleMarkPaid}
              disabled={isPending}
              className='text-xs px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/20 rounded-lg transition disabled:opacity-40'
            >
              {isPending ? '…' : 'Mark Paid'}
            </button>
            {error && <p className='text-xs text-red-400'>{error}</p>}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0);
  const totalLate = payments
    .filter((p) => p.status === 'late')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Payments</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          {payments.length} payment record{payments.length !== 1 ? 's' : ''}
        </p>
      </div>

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
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Paid Date
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Status
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
