'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  AddressValue,
  getProvinceOptions,
  getCityOptions,
  fetchBarangayOptions,
} from '@/lib/address';

export type { AddressValue };

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  disabled,
  loading,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string; meta?: string }[];
  disabled?: boolean;
  loading?: boolean;
  onSelect: (val: string, meta?: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value]);

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 50);
    return options
      .filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50);
  }, [query, options]);

  return (
    <div ref={ref} className='relative'>
      <label className='text-xs text-zinc-500 mb-1.5 block'>{label}</label>
      <div className='relative'>
        <input
          type='text'
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed'
        />
        {loading && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <svg
              className='w-4 h-4 text-indigo-400 animate-spin'
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
          </div>
        )}
      </div>
      {open && filtered.length > 0 && !disabled && (
        <ul className='absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl max-h-52 overflow-y-auto'>
          {filtered.map((opt) => (
            <li
              key={opt.value}
              onMouseDown={() => {
                onSelect(opt.value, opt.meta);
                setQuery(opt.label);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-zinc-700 transition ${opt.value === value ? 'text-indigo-400' : 'text-white'}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddressFields({ value, onChange }: Props) {
  const [barangayOptions, setBarangayOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const provinceOptions = useMemo(() => getProvinceOptions(), []);
  const cityOptions = useMemo(
    () => getCityOptions(value.province),
    [value.province],
  );

  useEffect(() => {
    let cancelled = false;
    if (!value.cityCode) {
      setTimeout(() => {
        if (!cancelled) {
          setBarangayOptions([]);
          setLoadingBarangays(false);
        }
      }, 0);
      return () => {
        cancelled = true;
      };
    }
    setTimeout(() => {
      if (!cancelled) setLoadingBarangays(true);
    }, 0);
    const apiCode = value.cityCode.slice(0, 2) + '0' + value.cityCode.slice(2);
    console.log(
      '[AddressFields] fetching barangays, cityCode:',
      value.cityCode,
      'apiCode:',
      apiCode,
    );
    fetchBarangayOptions(value.cityCode)
      .then((opts) => {
        if (!cancelled) setBarangayOptions(opts);
      })
      .catch(() => {
        if (!cancelled) setBarangayOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBarangays(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value.cityCode]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <div className='sm:col-span-2'>
        <SearchableSelect
          label='Province *'
          placeholder='Type to search province…'
          value={value.province}
          options={provinceOptions}
          onSelect={(province) =>
            onChange({
              ...value,
              province,
              city: '',
              cityCode: '',
              barangay: '',
            })
          }
        />
      </div>
      <div className='sm:col-span-2'>
        <SearchableSelect
          label='City / Municipality *'
          placeholder={
            value.province ? 'Type to search city…' : 'Select province first'
          }
          value={value.city}
          options={cityOptions}
          disabled={!value.province}
          onSelect={(city, cityCode) => {
            console.log(
              '[AddressFields] city selected:',
              city,
              'cityCode:',
              cityCode,
            );
            onChange({
              ...value,
              city,
              cityCode: cityCode ?? '',
              barangay: '',
            });
          }}
        />
      </div>
      <div className='sm:col-span-2'>
        <SearchableSelect
          label='Barangay'
          placeholder={
            !value.city
              ? 'Select city first'
              : loadingBarangays
                ? 'Loading barangays…'
                : 'Type to search barangay…'
          }
          value={value.barangay}
          options={barangayOptions}
          disabled={!value.city || loadingBarangays}
          loading={loadingBarangays}
          onSelect={(barangay) => onChange({ ...value, barangay })}
        />
      </div>
      <div className='sm:col-span-2'>
        <label className='text-xs text-zinc-500 mb-1.5 block'>
          Street <span className='text-zinc-600'>(optional)</span>
        </label>
        <input
          type='text'
          placeholder='e.g. 123 Rizal Street'
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
        />
      </div>
    </div>
  );
}
