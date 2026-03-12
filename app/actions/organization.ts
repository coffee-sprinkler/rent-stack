'use server';

import { prisma } from '@/db/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';
import type { MemberRole } from '@prisma/client';

// ─── Update Organization ──────────────────────────────────────────────────────

export async function updateOrganization(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    throw new Error('Unauthorized');
  if (!session.organizationId) throw new Error('No organization found.');

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string | null,
    phone: formData.get('phone') as string | null,
    address: formData.get('address') as string | null,
    website: formData.get('website') as string | null,
    logo_url: formData.get('logo_url') as string | null,
  };

  await prisma.organization.update({
    where: { id: session.organizationId },
    data,
  });

  revalidatePath('/dashboard/organization/settings');
}

// ─── Invite Member ────────────────────────────────────────────────────────────

export async function inviteMember(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    throw new Error('Unauthorized');

  const invitedEmail = formData.get('email') as string;
  const role = (formData.get('role') as MemberRole) ?? 'manager';

  if (!session.organizationId) throw new Error('No organization found.');
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organization_id_invited_email: {
        organization_id: session.organizationId,
        invited_email: invitedEmail,
      },
    },
  });

  if (existingMember) throw new Error('This email has already been invited.');

  const inviteToken = randomBytes(32).toString('hex');
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${inviteToken}`;

  await prisma.organizationMember.create({
    data: {
      organization_id: session.organizationId,
      invited_email: invitedEmail,
      role,
      invite_token: inviteToken,
    },
  });

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'RentStack <noreply@yourdomain.com>',
    to: invitedEmail,
    subject: "You've been invited to join an organization on RentStack",
    html: `
      <p>You've been invited to join an organization on RentStack.</p>
      <p><a href="${inviteUrl}">Accept Invitation</a></p>
      <p>This link will expire once used.</p>
    `,
  });

  revalidatePath('/dashboard/organization/members');
}

// ─── Accept Invite ────────────────────────────────────────────────────────────

export async function acceptInvite(token: string) {
  const session = await getSession();
  if (!session)
    throw new Error('You must be logged in to accept an invitation.');

  const member = await prisma.organizationMember.findUnique({
    where: { invite_token: token },
  });

  if (!member) throw new Error('Invalid or expired invite token.');
  if (member.invite_status === 'accepted')
    throw new Error('Invite has already been accepted.');
  if (member.invited_email !== session.email)
    throw new Error('This invite was sent to a different email.');

  await prisma.organizationMember.update({
    where: { invite_token: token },
    data: {
      invite_status: 'accepted',
      invite_token: null,
      user_id: session.userId,
    },
  });

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      organization_id: member.organization_id,
      role: member.role,
    },
  });
}

// ─── Remove Member ────────────────────────────────────────────────────────────

export async function removeMember(memberId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    throw new Error('Unauthorized');

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.organization_id !== session.organizationId) {
    throw new Error('Member not found.');
  }

  await prisma.organizationMember.delete({ where: { id: memberId } });

  revalidatePath('/dashboard/organization/members');
}

// ─── Update Member Role ───────────────────────────────────────────────────────

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'manager',
) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && !session.isOrgAdmin))
    throw new Error('Unauthorized');

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.organization_id !== session.organizationId) {
    throw new Error('Member not found.');
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
  });

  revalidatePath('/dashboard/organization/members');
}

// ─── Fix hasListings ──────────────────────────────────────────────────────────

export async function getHasListings(organizationId: string): Promise<boolean> {
  const unitCount = await prisma.unit.count({
    where: {
      property: { organization_id: organizationId },
    },
  });

  return unitCount > 0;
}
