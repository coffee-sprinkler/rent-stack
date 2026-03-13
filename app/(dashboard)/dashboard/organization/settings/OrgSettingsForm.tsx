'use client';

import { useTransition, useRef } from 'react';
import { updateOrganization } from '@/app/actions/organization';
import type { Organization } from '@prisma/client';

type Props = {
  org: Organization;
};

export function OrgSettingsForm({ org }: Props) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    startTransition(async () => {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      await updateOrganization(formData);
    });
  };

  return (
    <form ref={formRef} className='space-y-6 '>
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5'>
        <h2 className='text-sm font-semibold text-zinc-300 uppercase tracking-wider'>
          Organization details
        </h2>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>
            Organization name *
          </label>
          <input
            name='name'
            defaultValue={org.name}
            required
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Email</label>
            <input
              name='email'
              type='email'
              defaultValue={org.email ?? ''}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
          <div>
            <label className='text-xs text-zinc-500 mb-1.5 block'>Phone</label>
            <input
              name='phone'
              defaultValue={org.phone ?? ''}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
            />
          </div>
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Address</label>
          <input
            name='address'
            defaultValue={org.address ?? ''}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Website</label>
          <input
            name='website'
            defaultValue={org.website ?? ''}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>

        <div>
          <label className='text-xs text-zinc-500 mb-1.5 block'>Logo URL</label>
          <input
            name='logo_url'
            defaultValue={org.logo_url ?? ''}
            className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={isPending}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition text-sm'
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
