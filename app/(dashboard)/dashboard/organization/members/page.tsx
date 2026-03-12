import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MembersClient } from './MembersClient';

export default async function MembersPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const members = await prisma.organizationMember.findMany({
    where: { organization_id: session.organizationId },
    include: { user: { select: { name: true, avatar_url: true } } },
    orderBy: { created_at: 'asc' },
  });

  const serialized = members.map((m) => ({
    id: m.id,
    invitedEmail: m.invited_email,
    role: m.role,
    inviteStatus: m.invite_status,
    userName: m.user?.name ?? null,
    userAvatar: m.user?.avatar_url ?? null,
  }));

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Members</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Manage who has access to your organization.
        </p>
      </div>
      <MembersClient members={serialized} />
    </div>
  );
}
