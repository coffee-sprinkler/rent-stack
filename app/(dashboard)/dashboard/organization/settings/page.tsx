import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { OrgSettingsForm } from './OrgSettingsForm';

export default async function OrgSettingsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });

  if (!org) redirect('/dashboard/unauthorized');

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Organization Settings</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Manage your organization&apos;s profile and contact details.
        </p>
      </div>
      <OrgSettingsForm org={org} />
    </div>
  );
}
