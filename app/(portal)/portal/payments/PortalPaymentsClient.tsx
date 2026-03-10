'use client';
// app/(portal)/portal/payments/PortalPaymentsClient.tsx

import { useState } from 'react';
import Image from 'next/image';

type PaymentMethod = { id: string; label: string; qr_code_url: string };

type Payment = {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  payment_methods: PaymentMethod[];
  unit: { unit_number: string; property: { name: string } };
};

const STATUS_STYLES: Record<string, string> = {
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  late: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function PortalPaymentsClient({
  payments,
}: {
  payments: Payment[];
}) {
  const [qrPayment, setQrPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );

  function openQr(payment: Payment) {
    setQrPayment(payment);
    setSelectedMethod(payment.payment_methods[0] ?? null);
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0);
  const totalLate = payments
    .filter((p) => p.status === 'late')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className='px-8 py-8 max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Payments</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>Your payment history</p>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        {[
          { label: 'Paid', value: totalPaid, style: 'text-emerald-400' },
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
            Your payment records will appear here.
          </p>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Amount
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
                  Due Date
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
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
                <tr
                  key={p.id}
                  className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='text-white'>Unit {p.unit.unit_number}</p>
                    <p className='text-xs text-zinc-500'>
                      {p.unit.property.name}
                    </p>
                  </td>
                  <td className='px-6 py-4 text-white font-medium'>
                    ₱{p.amount.toLocaleString()}
                  </td>
                  <td className='px-6 py-4 text-zinc-400 hidden sm:table-cell'>
                    {new Date(p.due_date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className='px-6 py-4 text-zinc-400 hidden sm:table-cell'>
                    {p.paid_date
                      ? new Date(p.paid_date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    {p.status !== 'paid' && p.payment_methods.length > 0 && (
                      <button
                        onClick={() => openQr(p)}
                        className='text-xs px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/20 rounded-lg transition'
                      >
                        Pay via QR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Modal */}
      {qrPayment && (
        <div
          className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4'
          onClick={() => {
            setQrPayment(null);
            setSelectedMethod(null);
          }}
        >
          <div
            className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-bold'>Scan to Pay</h2>
              <button
                onClick={() => {
                  setQrPayment(null);
                  setSelectedMethod(null);
                }}
                className='text-zinc-500 hover:text-white transition text-xl'
              >
                ✕
              </button>
            </div>

            <p className='text-sm text-zinc-500 mb-1'>
              Unit {qrPayment.unit.unit_number} · {qrPayment.unit.property.name}
            </p>
            <p className='text-indigo-400 font-bold text-lg mb-4'>
              ₱{qrPayment.amount.toLocaleString()}
            </p>

            {/* Method tabs */}
            {qrPayment.payment_methods.length > 1 && (
              <div className='flex gap-2 mb-4 flex-wrap'>
                {qrPayment.payment_methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      selectedMethod?.id === m.id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {selectedMethod && (
              <>
                <p className='text-sm font-medium text-white mb-3'>
                  {selectedMethod.label}
                </p>
                <div className='bg-white rounded-xl p-4 relative w-full aspect-square'>
                  <Image
                    src={selectedMethod.qr_code_url}
                    alt={selectedMethod.label}
                    fill
                    className='object-contain p-2'
                  />
                </div>
              </>
            )}

            <p className='text-xs text-zinc-500 text-center mt-4'>
              Scan with{' '}
              {qrPayment.payment_methods.map((m) => m.label).join(', ')} or any
              QR payment app. Contact your landlord after payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
