'use client';
// app/(dashboard)/dashboard/profile/ProfileClient.tsx

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type PaymentMethod = {
  id: string;
  label: string;
  qr_code_url: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  payment_methods: PaymentMethod[];
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

async function uploadToCloudinary(file: File): Promise<string> {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: data,
    },
  );
  const json = await res.json();
  if (!json.secure_url) throw new Error('Upload failed');
  return json.secure_url;
}

export default function ProfileClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    user.payment_methods,
  );
  const [newLabel, setNewLabel] = useState('');
  const [newQrUrl, setNewQrUrl] = useState('');
  const [uploadingQr, setUploadingQr] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [savingMethod, startMethodTransition] = useTransition();
  const qrInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
    } catch {
      setError('Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewQrUrl(url);
    } catch {
      setError('QR upload failed.');
    } finally {
      setUploadingQr(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, avatar_url: avatarUrl }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleAddMethod() {
    if (!newLabel.trim() || !newQrUrl) return;
    startMethodTransition(async () => {
      try {
        const res = await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: newLabel.trim(),
            qr_code_url: newQrUrl,
          }),
        });
        if (!res.ok) throw new Error('Failed');
        const method = await res.json();
        setPaymentMethods((prev) => [...prev, method]);
        setNewLabel('');
        setNewQrUrl('');
        setAddingMethod(false);
      } catch {
        setError('Could not add payment method.');
      }
    });
  }

  async function handleDeleteMethod(id: string) {
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError('Could not delete payment method.');
    }
  }

  return (
    <div className='px-8 py-8 max-w-3xl mx-auto'>
      <div className='flex items-center gap-2 text-sm text-zinc-500 mb-6'>
        <Link href='/dashboard' className='hover:text-white transition'>
          Dashboard
        </Link>
        <span>/</span>
        <span className='text-white'>Profile</span>
      </div>

      {/* Header with clickable avatar */}
      <div className='flex items-center gap-5 mb-8'>
        <div
          className='relative group cursor-pointer'
          onClick={() => avatarInputRef.current?.click()}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={72}
              height={72}
              className='rounded-full object-cover border-2 border-zinc-700'
            />
          ) : (
            <div className='w-[72px] h-[72px] rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0'>
              {getInitials(name)}
            </div>
          )}
          <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
            <span className='text-white text-xs'>
              {uploadingAvatar ? '…' : '📷'}
            </span>
          </div>
        </div>
        <div>
          <h1 className='text-2xl font-bold'>{user.name}</h1>
          <p className='text-zinc-500 text-sm'>
            {user.email} · <span className='capitalize'>{user.role}</span>
          </p>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className='text-xs text-indigo-400 hover:text-indigo-300 transition mt-1'
          >
            {uploadingAvatar ? 'Uploading…' : 'Change photo'}
          </button>
        </div>
        <input
          ref={avatarInputRef}
          type='file'
          accept='image/*'
          onChange={handleAvatarUpload}
          className='hidden'
        />
      </div>

      {/* Account Info */}
      <section className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 mb-6'>
        <h2 className='text-lg font-semibold'>Account Info</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Email</label>
            <input
              value={user.email}
              disabled
              className='w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+63 9XX XXX XXXX'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>
      </section>

      {/* Save account */}
      <div className='flex items-center gap-3 mb-8'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg transition font-medium'
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <p className='text-sm text-emerald-400'>✓ Saved!</p>}
        {error && <p className='text-sm text-red-400'>{error}</p>}
      </div>

      {/* Payment Methods */}
      <section className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold'>Payment QR Codes</h2>
            <p className='text-xs text-zinc-500 mt-0.5'>
              Tenants will see these when a payment is due.
            </p>
          </div>
          {!addingMethod && (
            <button
              onClick={() => setAddingMethod(true)}
              className='text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition'
            >
              + Add
            </button>
          )}
        </div>

        {/* Existing methods */}
        {paymentMethods.length > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
            {paymentMethods.map((m) => (
              <div key={m.id} className='bg-zinc-800 rounded-xl p-3 space-y-2'>
                <p className='text-sm font-medium text-white'>{m.label}</p>
                <div className='bg-white rounded-lg p-2 relative aspect-square'>
                  <Image
                    src={m.qr_code_url}
                    alt={m.label}
                    fill
                    className='object-contain p-1'
                  />
                </div>
                <button
                  onClick={() => handleDeleteMethod(m.id)}
                  className='text-xs text-rose-400 hover:text-rose-300 transition'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new method form */}
        {addingMethod && (
          <div className='border border-zinc-700 rounded-xl p-4 space-y-4'>
            <div>
              <label className='text-xs text-zinc-500 mb-1.5 block'>
                Label *
              </label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='e.g. GCash, Maya, BPI'
                className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
              />
            </div>

            {newQrUrl ? (
              <div className='flex items-center gap-4'>
                <div className='w-24 h-24 bg-white rounded-xl relative shrink-0'>
                  <Image
                    src={newQrUrl}
                    alt='QR'
                    fill
                    className='object-contain p-2'
                  />
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-emerald-400'>✓ QR uploaded</p>
                  <button
                    onClick={() => {
                      setNewQrUrl('');
                      qrInputRef.current?.click();
                    }}
                    className='text-xs text-zinc-400 hover:text-white transition'
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => qrInputRef.current?.click()}
                disabled={uploadingQr}
                className='w-full border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl py-6 text-center transition disabled:opacity-40'
              >
                <p className='text-xl mb-1'>📷</p>
                <p className='text-sm text-zinc-400'>
                  {uploadingQr ? 'Uploading…' : 'Upload QR code'}
                </p>
              </button>
            )}

            <input
              ref={qrInputRef}
              type='file'
              accept='image/*'
              onChange={handleQrUpload}
              className='hidden'
            />

            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setAddingMethod(false);
                  setNewLabel('');
                  setNewQrUrl('');
                }}
                className='flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white py-2.5 rounded-xl text-sm transition'
              >
                Cancel
              </button>
              <button
                onClick={handleAddMethod}
                disabled={!newLabel.trim() || !newQrUrl || savingMethod}
                className='flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition'
              >
                {savingMethod ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && !addingMethod && (
          <p className='text-zinc-600 text-sm text-center py-4'>
            No payment methods yet.
          </p>
        )}
      </section>
    </div>
  );
}
