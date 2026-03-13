'use client';
// app/(dashboard)/dashboard/leases/[id]/LeaseDetailClient.tsx

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  editLease,
  renewLease,
  terminateLease,
  saveLeaseDocumentUrl,
} from '@/app/actions/leases';
import { useRef } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

type PaymentStatus = 'pending' | 'paid' | 'late';
type LeaseStatus = 'active' | 'expired' | 'terminated';

type Payment = {
  id: string;
  amount: number;
  due_date: Date | string;
  paid_date: Date | string | null;
  status: PaymentStatus;
};

type Lease = {
  id: string;
  status: LeaseStatus;
  start_date: Date | string;
  end_date: Date | string;
  monthly_rent: number;
  deposit_amount: number;
  terminated_at: Date | string | null;
  termination_reason: string | null;
  document_url: string | null;
  renewed_from_id: string | null;
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  unit: {
    id: string;
    unit_number: string;
    property: { id: string; name: string };
  };
  payments: Payment[];
};

type Props = { lease: Lease };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function toInputDate(date: Date | string) {
  return new Date(date).toISOString().split('T')[0];
}

function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const styles: Record<LeaseStatus, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    terminated: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    late: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='fixed inset-0 bg-black/60' onClick={onClose} />
      <div className='relative z-10 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl'>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-base font-semibold text-white'>{title}</h2>
          <button
            onClick={onClose}
            className='text-zinc-500 hover:text-white transition text-lg leading-none'
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ lease, onClose }: { lease: Lease; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.set('leaseId', lease.id);
    startTransition(async () => {
      try {
        await editLease(formData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <ModalShell title='Edit Lease' onClose={onClose}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input type='hidden' name='leaseId' value={lease.id} />
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
              Start Date
            </label>
            <input
              type='date'
              name='startDate'
              defaultValue={toInputDate(lease.start_date)}
              required
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
              End Date
            </label>
            <input
              type='date'
              name='endDate'
              defaultValue={toInputDate(lease.end_date)}
              required
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
            Monthly Rent (₱)
          </label>
          <input
            type='number'
            name='monthlyRent'
            defaultValue={lease.monthly_rent}
            min={0}
            step={0.01}
            required
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          />
        </div>
        {error && <p className='text-xs text-rose-400'>{error}</p>}
        <div className='flex gap-3 pt-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-zinc-700 text-zinc-400 hover:text-white text-sm rounded-lg py-2 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isPending}
            className='flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg py-2 transition'
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Renew Modal ──────────────────────────────────────────────────────────────

function RenewModal({ lease, onClose }: { lease: Lease; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.set('leaseId', lease.id);
    startTransition(async () => {
      try {
        await renewLease(formData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <ModalShell title='Renew Lease' onClose={onClose}>
      <p className='text-sm text-zinc-400 mb-4'>
        Current end date: {formatDate(lease.end_date)}
      </p>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
            New End Date
          </label>
          <input
            type='date'
            name='newEndDate'
            min={toInputDate(lease.end_date)}
            required
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          />
        </div>
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
            New Monthly Rent (₱)
          </label>
          <input
            type='number'
            name='newRent'
            defaultValue={lease.monthly_rent}
            min={0}
            step={0.01}
            required
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
          />
        </div>
        {error && <p className='text-xs text-rose-400'>{error}</p>}
        <div className='flex gap-3 pt-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-zinc-700 text-zinc-400 hover:text-white text-sm rounded-lg py-2 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isPending}
            className='flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg py-2 transition'
          >
            {isPending ? 'Renewing…' : 'Confirm Renewal'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Terminate Modal ──────────────────────────────────────────────────────────

function TerminateModal({
  lease,
  onClose,
}: {
  lease: Lease;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.set('leaseId', lease.id);
    startTransition(async () => {
      try {
        await terminateLease(formData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <ModalShell title='Terminate Lease' onClose={onClose}>
      <p className='text-sm text-zinc-500 mb-4'>
        The unit will automatically be set back to available.
      </p>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
            Reason (optional)
          </label>
          <textarea
            name='reason'
            rows={3}
            placeholder='e.g. Non-payment of rent, tenant request…'
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none'
          />
        </div>
        {error && <p className='text-xs text-rose-400'>{error}</p>}
        <div className='flex gap-3 pt-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-zinc-700 text-zinc-400 hover:text-white text-sm rounded-lg py-2 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isPending}
            className='flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm rounded-lg py-2 transition'
          >
            {isPending ? 'Terminating…' : 'Terminate Lease'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Upload Doc Modal ─────────────────────────────────────────────────────────

function UploadDocModal({
  lease,
  onClose,
}: {
  lease: Lease;
  onClose: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    setError('');
    setIsPending(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: data },
      );
      const json = await res.json();
      if (!json.secure_url) throw new Error('Upload failed');
      await saveLeaseDocumentUrl(lease.id, json.secure_url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ModalShell title='Upload Lease Contract' onClose={onClose}>
      {lease.document_url && (
        <a
          href={lease.document_url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-indigo-400 hover:text-indigo-300 transition block mb-4'
        >
          View current document →
        </a>
      )}
      <div className='space-y-4'>
        <input
          ref={fileRef}
          type='file'
          accept='application/pdf'
          className='w-full text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 transition cursor-pointer'
        />
        {error && <p className='text-xs text-rose-400'>{error}</p>}
        <div className='flex gap-3 pt-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-zinc-700 text-zinc-400 hover:text-white text-sm rounded-lg py-2 transition'
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isPending}
            className='flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg py-2 transition'
          >
            {isPending ? 'Uploading…' : 'Upload PDF'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type ModalType = 'edit' | 'renew' | 'terminate' | 'upload' | null;

export default function LeaseDetailClient({ lease }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const tenantName = `${lease.tenant.first_name} ${lease.tenant.last_name}`;

  const paidCount = lease.payments.filter((p) => p.status === 'paid').length;
  const pendingCount = lease.payments.filter(
    (p) => p.status === 'pending',
  ).length;
  const lateCount = lease.payments.filter((p) => p.status === 'late').length;

  return (
    <div className='px-8 py-8 max-w-5xl mx-auto'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard/leases' className='hover:text-white transition'>
          Leases
        </Link>
        <span>/</span>
        <span className='text-white'>{tenantName}</span>
      </div>

      {/* Header */}
      <div className='flex items-start justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-1'>
            <h1 className='text-2xl font-bold text-white'>{tenantName}</h1>
            <LeaseStatusBadge status={lease.status} />
          </div>
          <p className='text-zinc-500 text-sm'>
            {lease.unit.property.name} — Unit {lease.unit.unit_number}
          </p>
        </div>

        {/* Actions — only for active leases */}
        {lease.status === 'active' && (
          <div className='flex gap-2'>
            <button
              onClick={() => setModal('edit')}
              className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm rounded-xl px-4 py-2 transition'
            >
              Edit
            </button>
            <button
              onClick={() => setModal('upload')}
              className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm rounded-xl px-4 py-2 transition'
            >
              {lease.document_url ? 'Replace Doc' : 'Upload Doc'}
            </button>
            <button
              onClick={() => setModal('renew')}
              className='border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-400 hover:text-indigo-300 text-sm rounded-xl px-4 py-2 transition'
            >
              Renew
            </button>
            <button
              onClick={() => setModal('terminate')}
              className='border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 text-sm rounded-xl px-4 py-2 transition'
            >
              Terminate
            </button>
          </div>
        )}

        {/* Non-active: only allow doc upload */}
        {lease.status !== 'active' && (
          <button
            onClick={() => setModal('upload')}
            className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm rounded-xl px-4 py-2 transition'
          >
            {lease.document_url ? 'Replace Doc' : 'Upload Doc'}
          </button>
        )}
      </div>

      {/* Info cards */}
      <div className='grid grid-cols-2 gap-4 mb-8'>
        {/* Lease details */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3'>
          <h2 className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
            Lease Details
          </h2>
          {[
            { label: 'Start Date', value: formatDate(lease.start_date) },
            { label: 'End Date', value: formatDate(lease.end_date) },
            {
              label: 'Monthly Rent',
              value: `₱${lease.monthly_rent.toLocaleString()}`,
            },
            {
              label: 'Deposit',
              value: `₱${lease.deposit_amount.toLocaleString()}`,
            },
            {
              label: 'Contract',
              value: lease.document_url ? (
                <a
                  href={lease.document_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-indigo-400 hover:text-indigo-300 transition'
                >
                  View PDF →
                </a>
              ) : (
                <span className='text-zinc-600'>No document uploaded</span>
              ),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className='flex justify-between items-center text-sm'
            >
              <span className='text-zinc-500'>{label}</span>
              <span className='text-white'>{value}</span>
            </div>
          ))}
          {lease.status === 'terminated' && lease.termination_reason && (
            <div className='pt-2 border-t border-zinc-800'>
              <p className='text-xs text-zinc-500 mb-1'>Termination Reason</p>
              <p className='text-sm text-zinc-300'>
                {lease.termination_reason}
              </p>
            </div>
          )}
        </div>

        {/* Tenant details */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3'>
          <h2 className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
            Tenant
          </h2>
          {[
            { label: 'Name', value: tenantName },
            { label: 'Email', value: lease.tenant.email },
            { label: 'Phone', value: lease.tenant.phone ?? '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className='flex justify-between items-center text-sm'
            >
              <span className='text-zinc-500'>{label}</span>
              <span className='text-white'>{value}</span>
            </div>
          ))}

          {/* Payment summary */}
          <div className='pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center'>
            {[
              { label: 'Paid', count: paidCount, color: 'text-green-400' },
              {
                label: 'Pending',
                count: pendingCount,
                color: 'text-yellow-400',
              },
              { label: 'Late', count: lateCount, color: 'text-rose-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className='bg-zinc-800/50 rounded-xl py-2'>
                <p className={`text-lg font-bold ${color}`}>{count}</p>
                <p className='text-xs text-zinc-500'>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment schedule */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-zinc-800'>
          <h2 className='text-sm font-semibold text-white'>Payment Schedule</h2>
          <p className='text-xs text-zinc-500 mt-0.5'>
            {lease.payments.length} payment
            {lease.payments.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {lease.payments.length === 0 ? (
          <div className='px-6 py-12 text-center text-zinc-600 text-sm'>
            No payment records.
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Due Date
                </th>
                <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Amount
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Status
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Paid Date
                </th>
              </tr>
            </thead>
            <tbody>
              {lease.payments.map((payment) => (
                <tr
                  key={payment.id}
                  className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
                >
                  <td className='px-6 py-3 text-zinc-300'>
                    {formatDate(payment.due_date)}
                  </td>
                  <td className='px-6 py-3 text-right text-indigo-400 font-medium'>
                    ₱{payment.amount.toLocaleString()}
                  </td>
                  <td className='px-6 py-3'>
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className='px-6 py-3 text-zinc-500 text-xs'>
                    {payment.paid_date ? formatDate(payment.paid_date) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modal === 'edit' && (
        <EditModal lease={lease} onClose={() => setModal(null)} />
      )}
      {modal === 'renew' && (
        <RenewModal lease={lease} onClose={() => setModal(null)} />
      )}
      {modal === 'terminate' && (
        <TerminateModal lease={lease} onClose={() => setModal(null)} />
      )}
      {modal === 'upload' && (
        <UploadDocModal lease={lease} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
