'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/app/actions/properties';
import AddressFields, { AddressValue } from './AddressFields';

type Step = 'property' | 'unit' | 'review';

const STEPS: { key: Step; label: string; desc: string }[] = [
  { key: 'property', label: 'Property', desc: 'Basic info' },
  { key: 'unit', label: 'Unit', desc: 'Details & pricing' },
  { key: 'review', label: 'Review', desc: 'Confirm & publish' },
];

const PROPERTY_TYPES = ['apartment', 'house', 'condo', 'townhouse', 'studio'];
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

type UploadedImage = { url: string; caption: string };

type UnitForm = {
  unit_number: string;
  floor: string;
  bedrooms: string;
  bathrooms: string;
  rent_amount: string;
};

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).secure_url;
}

export default function NewPropertyClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('property');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [address, setAddress] = useState<AddressValue>({
    province: '',
    city: '',
    cityCode: '',
    barangay: '',
    street: '',
  });
  const [unit, setUnit] = useState<UnitForm>({
    unit_number: '',
    floor: '',
    bedrooms: '1',
    bathrooms: '1',
    rent_amount: '',
  });

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function updateUnit(field: keyof UnitForm, value: string) {
    setUnit((u) => ({ ...u, [field]: value }));
  }

  const canAdvanceProperty =
    propertyName.trim() && address.province && address.city && propertyType;
  const canAdvanceUnit =
    unit.unit_number.trim() &&
    unit.bedrooms &&
    unit.bathrooms &&
    unit.rent_amount;

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError('');
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setImages((prev) => [
        ...prev,
        ...urls.map((url) => ({ url, caption: '' })),
      ]);
    } catch {
      setError('One or more images failed to upload. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      try {
        await createProperty({
          property: {
            name: propertyName,
            province: address.province,
            city: address.city,
            barangay: address.barangay,
            street: address.street,
            property_type: propertyType,
          },
          unit,
          images,
        });
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/properties'), 2000);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  const addressSummary = [
    address.street,
    address.barangay,
    address.city,
    address.province,
  ]
    .filter(Boolean)
    .join(', ');

  if (success) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto'>
            <svg
              className='w-8 h-8 text-emerald-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <p className='text-white text-xl font-semibold'>Listing published!</p>
          <p className='text-zinc-500 text-sm'>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='max-w-3xl mx-auto px-6 py-12'>
        <div className='mb-10'>
          <p className='text-indigo-400 text-sm font-medium tracking-widest uppercase mb-2'>
            New listing
          </p>
          <h1 className='text-3xl font-bold tracking-tight'>
            List your property
          </h1>
          <p className='text-zinc-500 text-sm mt-1.5'>
            Fill in your property and unit details to get listed.
          </p>
        </div>

        {/* Step indicators */}
        <div className='flex items-center gap-0 mb-10'>
          {STEPS.map((s, idx) => (
            <div key={s.key} className='flex items-center flex-1'>
              <button
                onClick={() => {
                  if (idx < stepIndex) setStep(s.key);
                }}
                className={`flex items-center gap-3 ${idx < stepIndex ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition ${s.key === step ? 'bg-indigo-600 text-white' : idx < stepIndex ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border border-zinc-700 text-zinc-600'}`}
                >
                  {idx < stepIndex ? (
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2.5}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className='text-left hidden sm:block'>
                  <p
                    className={`text-sm font-medium ${s.key === step ? 'text-white' : 'text-zinc-500'}`}
                  >
                    {s.label}
                  </p>
                  <p className='text-xs text-zinc-600'>{s.desc}</p>
                </div>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 transition ${idx < stepIndex ? 'bg-emerald-500/30' : 'bg-zinc-800'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: Property */}
        {step === 'property' && (
          <div className='space-y-6'>
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
              <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                Property information
              </h2>
              <div>
                <label className='text-xs text-zinc-500 mb-1.5 block'>
                  Property name *
                </label>
                <input
                  type='text'
                  placeholder='e.g. Sunrise Residences'
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
                />
              </div>
              <div>
                <label className='text-xs text-zinc-500 mb-1.5 block'>
                  Property type *
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className='pt-1'>
                <p className='text-xs text-zinc-500 mb-3'>Address</p>
                <AddressFields value={address} onChange={setAddress} />
              </div>
            </div>
            <div className='flex justify-end'>
              <button
                onClick={() => setStep('unit')}
                disabled={!canAdvanceProperty}
                className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step: Unit */}
        {step === 'unit' && (
          <div className='space-y-6'>
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
              <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                Unit details
              </h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                <div>
                  <label className='text-xs text-zinc-500 mb-1.5 block'>
                    Unit number *
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. 4A'
                    value={unit.unit_number}
                    onChange={(e) => updateUnit('unit_number', e.target.value)}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
                  />
                </div>
                <div>
                  <label className='text-xs text-zinc-500 mb-1.5 block'>
                    Floor
                  </label>
                  <input
                    type='number'
                    placeholder='e.g. 4'
                    value={unit.floor}
                    onChange={(e) => updateUnit('floor', e.target.value)}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
                  />
                </div>
                <div>
                  <label className='text-xs text-zinc-500 mb-1.5 block'>
                    Monthly rent (₱) *
                  </label>
                  <input
                    type='number'
                    placeholder='e.g. 15000'
                    value={unit.rent_amount}
                    onChange={(e) => updateUnit('rent_amount', e.target.value)}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
                  />
                </div>
                <div>
                  <label className='text-xs text-zinc-500 mb-1.5 block'>
                    Bedrooms *
                  </label>
                  <select
                    value={unit.bedrooms}
                    onChange={(e) => updateUnit('bedrooms', e.target.value)}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} bedroom{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='text-xs text-zinc-500 mb-1.5 block'>
                    Bathrooms *
                  </label>
                  <select
                    value={unit.bathrooms}
                    onChange={(e) => updateUnit('bathrooms', e.target.value)}
                    className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition'
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} bathroom{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                  Photos
                </h2>
                <span className='text-xs text-zinc-600'>
                  Optional · up to 10 images
                </span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 10}
                className='w-full border-2 border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-indigo-500/5 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-8 flex flex-col items-center gap-2 transition'
              >
                {uploading ? (
                  <>
                    <svg
                      className='w-6 h-6 text-indigo-400 animate-spin'
                      viewBox='0 0 24 24'
                      fill='none'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    <span className='text-sm text-zinc-400'>Uploading…</span>
                  </>
                ) : (
                  <>
                    <svg
                      className='w-6 h-6 text-zinc-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                      />
                    </svg>
                    <span className='text-sm text-zinc-400'>
                      Click to upload photos
                    </span>
                    <span className='text-xs text-zinc-600'>
                      JPG, PNG, WEBP
                    </span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                multiple
                className='hidden'
                onChange={handleImagePick}
              />
              {images.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {images.map((img, idx) => (
                    <div key={idx} className='space-y-1.5'>
                      <div className='relative h-28 rounded-xl overflow-hidden bg-zinc-800 group'>
                        <Image
                          src={img.url}
                          alt={`Upload ${idx + 1}`}
                          fill
                          className='object-cover'
                        />
                        <button
                          onClick={() =>
                            setImages((p) => p.filter((_, i) => i !== idx))
                          }
                          className='absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition'
                        >
                          <svg
                            className='w-3 h-3'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                        {idx === 0 && (
                          <span className='absolute bottom-1.5 left-1.5 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full'>
                            Cover
                          </span>
                        )}
                      </div>
                      <input
                        type='text'
                        placeholder='Caption (optional)'
                        value={img.caption}
                        onChange={(e) =>
                          setImages((p) =>
                            p.map((im, i) =>
                              i === idx
                                ? { ...im, caption: e.target.value }
                                : im,
                            ),
                          )
                        }
                        className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
                      />
                    </div>
                  ))}
                </div>
              )}
              {error && <p className='text-red-400 text-xs'>{error}</p>}
            </div>

            <div className='flex justify-between'>
              <button
                onClick={() => setStep('property')}
                className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  setError('');
                  setStep('review');
                }}
                disabled={!canAdvanceUnit || uploading}
                className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className='space-y-6'>
            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                  Property
                </h2>
                <button
                  onClick={() => setStep('property')}
                  className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                >
                  Edit
                </button>
              </div>
              <div className='text-sm'>
                {[
                  { label: 'Name', value: propertyName },
                  { label: 'Type', value: propertyType, cls: 'capitalize' },
                  { label: 'Address', value: addressSummary },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className='flex justify-between py-2.5 border-b border-zinc-800 last:border-0'
                  >
                    <span className='text-zinc-500'>{label}</span>
                    <span
                      className={`text-white text-right max-w-xs ${cls ?? ''}`}
                    >
                      {value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                  Unit
                </h2>
                <button
                  onClick={() => setStep('unit')}
                  className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                >
                  Edit
                </button>
              </div>
              <div className='text-sm'>
                {[
                  { label: 'Unit number', value: unit.unit_number },
                  { label: 'Floor', value: unit.floor || '—' },
                  {
                    label: 'Bedrooms / Bathrooms',
                    value: `${unit.bedrooms} bed · ${unit.bathrooms} bath`,
                  },
                  {
                    label: 'Monthly rent',
                    value: `₱${Number(unit.rent_amount).toLocaleString()}/mo`,
                    cls: 'text-indigo-400 font-bold',
                  },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className='flex justify-between py-2.5 border-b border-zinc-800 last:border-0'
                  >
                    <span className='text-zinc-500'>{label}</span>
                    <span className={cls ?? 'text-white'}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 0 && (
              <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
                    Photos{' '}
                    <span className='text-zinc-600 normal-case font-normal'>
                      ({images.length})
                    </span>
                  </h2>
                  <button
                    onClick={() => setStep('unit')}
                    className='text-xs text-indigo-400 hover:text-indigo-300 transition'
                  >
                    Edit
                  </button>
                </div>
                <div className='flex gap-2 overflow-x-auto pb-1'>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className='relative shrink-0 w-20 h-14 rounded-lg overflow-hidden'
                    >
                      <Image
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm'>
                {error}
              </div>
            )}

            <div className='flex justify-between'>
              <button
                onClick={() => setStep('unit')}
                className='border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-6 py-3 rounded-xl text-sm transition'
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition text-sm flex items-center gap-2'
              >
                {isPending ? (
                  <>
                    <svg
                      className='w-4 h-4 animate-spin'
                      viewBox='0 0 24 24'
                      fill='none'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    Publishing…
                  </>
                ) : (
                  'Publish listing ✓'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
