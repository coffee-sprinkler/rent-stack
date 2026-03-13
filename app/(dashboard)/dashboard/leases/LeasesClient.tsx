'use client';
// app/(dashboard)/dashboard/leases/LeasesClient.tsx

import { useState, useTransition, useRef } from 'react';
import {
  terminateLease,
  renewLease,
  saveLeaseDocumentUrl,
} from '@/app/actions/leases';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

type LeaseStatus = 'active' | 'expired' | 'terminated';

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
  tenant: { id: string; first_name: string; last_name: string; email: string };
  unit: {
    id: string;
    unit_number: string;
    property: { id: string; name: string };
  };
};

type FilterTab = 'all' | LeaseStatus;

type Props = {
  leases: Lease[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge(props: { status: LeaseStatus }) {
  const { status } = props;
  const styles: Record<LeaseStatus, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    terminated: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Renew Modal ──────────────────────────────────────────────────────────────

function RenewModal(props: { lease: Lease; onClose: () => void }) {
  const { lease, onClose } = props;
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

  const minDate = new Date(lease.end_date).toISOString().split('T')[0];

  return (
    <ModalShell title='Renew Lease' onClose={onClose}>
      <div className='mb-4 text-sm text-zinc-400'>
        <p>
          {`${lease.tenant.first_name} ${lease.tenant.last_name}`} —{' '}
          {lease.unit.property.name} Unit {lease.unit.unit_number}
        </p>
        <p className='text-zinc-500 text-xs mt-0.5'>
          Current end date: {formatDate(lease.end_date)}
        </p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input type='hidden' name='leaseId' value={lease.id} />
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-1'>
            New End Date
          </label>
          <input
            type='date'
            name='newEndDate'
            min={minDate}
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

function TerminateModal(props: { lease: Lease; onClose: () => void }) {
  const { lease, onClose } = props;
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
      <div className='mb-4 text-sm text-zinc-400'>
        <p>
          {`${lease.tenant.first_name} ${lease.tenant.last_name}`} —{' '}
          {lease.unit.property.name} Unit {lease.unit.unit_number}
        </p>
        <p className='text-xs text-zinc-500 mt-0.5'>
          The unit will be automatically set to vacant.
        </p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input type='hidden' name='leaseId' value={lease.id} />
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

function UploadDocModal(props: { lease: Lease; onClose: () => void }) {
  const { lease, onClose } = props;
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
      const documentUrl = await uploadPdfToCloudinary(file);
      await saveLeaseDocumentUrl(lease.id, documentUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ModalShell title='Upload Lease Contract' onClose={onClose}>
      <div className='mb-4 text-sm text-zinc-400'>
        <p>
          {`${lease.tenant.first_name} ${lease.tenant.last_name}`} —{' '}
          {lease.unit.property.name} Unit {lease.unit.unit_number}
        </p>
        {lease.document_url && (
          <a
            href={lease.document_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-indigo-400 hover:text-indigo-300 transition mt-1 block'
          >
            View current document →
          </a>
        )}
      </div>
      <div className='space-y-4'>
        <div>
          <label className='text-xs text-zinc-500 uppercase tracking-widest block mb-2'>
            PDF Contract
          </label>
          <input
            ref={fileRef}
            type='file'
            accept='application/pdf'
            className='w-full text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 transition cursor-pointer'
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

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell(props: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { title, onClose, children } = props;
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

// ─── Cloudinary PDF upload ────────────────────────────────────────────────────
// Uses /raw/upload endpoint instead of /image/upload — same preset works.

async function uploadPdfToCloudinary(file: File): Promise<string> {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: data },
  );

  const json = await res.json();
  if (!json.secure_url) throw new Error('Upload failed');
  return json.secure_url;
}

// ─── Main component ───────────────────────────────────────────────────────────

type ModalState =
  | { type: 'renew'; lease: Lease }
  | { type: 'terminate'; lease: Lease }
  | { type: 'upload'; lease: Lease }
  | null;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'expired', label: 'Expired' },
  { id: 'terminated', label: 'Terminated' },
];

export default function LeasesClient(props: Props) {
  const { leases } = props;
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [modal, setModal] = useState<ModalState>(null);

  const counts: Record<FilterTab, number> = {
    all: leases.length,
    active: leases.filter((l) => l.status === 'active').length,
    expired: leases.filter((l) => l.status === 'expired').length,
    terminated: leases.filter((l) => l.status === 'terminated').length,
  };

  const filtered =
    activeFilter === 'all'
      ? leases
      : leases.filter((l) => l.status === activeFilter);

  function closeModal() {
    setModal(null);
  }

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-white'>Leases</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Manage lease renewals, terminations, and contracts
        </p>
      </div>

      {/* Filter tabs */}
      <div className='flex gap-1 mb-6 border-b border-zinc-800'>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeFilter === tab.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-indigo-600/30 text-indigo-300'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className='text-center py-24 text-zinc-600'>
          <p className='text-lg'>No leases found.</p>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Tenant
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Unit
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Period
                </th>
                <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Rent
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Status
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Doc
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lease) => (
                <tr
                  key={lease.id}
                  className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='text-white font-medium'>{`${lease.tenant.first_name} ${lease.tenant.last_name}`}</p>
                    <p className='text-xs text-zinc-500'>
                      {lease.tenant.email}
                    </p>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-zinc-300'>{lease.unit.property.name}</p>
                    <p className='text-xs text-zinc-500'>
                      Unit {lease.unit.unit_number}
                    </p>
                  </td>
                  <td className='px-6 py-4 text-zinc-400 text-xs'>
                    <p>{formatDate(lease.start_date)}</p>
                    <p>→ {formatDate(lease.end_date)}</p>
                  </td>
                  <td className='px-6 py-4 text-right text-indigo-400 font-medium'>
                    ₱{lease.monthly_rent.toLocaleString()}
                  </td>
                  <td className='px-6 py-4'>
                    <StatusBadge status={lease.status} />
                    {lease.status === 'terminated' &&
                      lease.termination_reason && (
                        <p
                          className='text-xs text-zinc-600 mt-1 max-w-[140px] truncate'
                          title={lease.termination_reason}
                        >
                          {lease.termination_reason}
                        </p>
                      )}
                  </td>
                  <td className='px-6 py-4'>
                    {lease.document_url ? (
                      <a
                        href={lease.document_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className='text-xs text-zinc-600'>—</span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2 justify-end'>
                      {/* Upload doc always available */}
                      <button
                        onClick={() => setModal({ type: 'upload', lease })}
                        className='text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-2.5 py-1.5 transition'
                      >
                        {lease.document_url ? 'Replace Doc' : 'Upload Doc'}
                      </button>

                      {/* Renew — only for active leases */}
                      {lease.status === 'active' && (
                        <button
                          onClick={() => setModal({ type: 'renew', lease })}
                          className='text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 rounded-lg px-2.5 py-1.5 transition'
                        >
                          Renew
                        </button>
                      )}

                      {/* Terminate — only for active leases */}
                      {lease.status === 'active' && (
                        <button
                          onClick={() => setModal({ type: 'terminate', lease })}
                          className='text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 rounded-lg px-2.5 py-1.5 transition'
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'renew' && (
        <RenewModal lease={modal.lease} onClose={closeModal} />
      )}
      {modal?.type === 'terminate' && (
        <TerminateModal lease={modal.lease} onClose={closeModal} />
      )}
      {modal?.type === 'upload' && (
        <UploadDocModal lease={modal.lease} onClose={closeModal} />
      )}
    </div>
  );
}
