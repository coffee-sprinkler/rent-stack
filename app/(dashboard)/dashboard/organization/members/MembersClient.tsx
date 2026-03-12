'use client';

import { useState, useTransition } from 'react';
import {
  inviteMember,
  removeMember,
  updateMemberRole,
} from '@/app/actions/organization';

type Member = {
  id: string;
  invitedEmail: string;
  role: string;
  inviteStatus: string;
  userName: string | null;
  userAvatar: string | null;
};

type Props = {
  members: Member[];
};

export function MembersClient({ members: initial }: Props) {
  const [members, setMembers] = useState(initial);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInvite = () => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set('email', email);
        formData.set('role', role);
        await inviteMember(formData);
        setEmail('');
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to invite member.',
        );
      }
    });
  };

  const handleRemove = (memberId: string) => {
    startTransition(async () => {
      await removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    });
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'manager') => {
    startTransition(async () => {
      await updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
    });
  };

  return (
    <div className='space-y-5'>
      {/* Invite Form */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4'>
        <h2 className='text-sm font-semibold text-zinc-300'>Invite a Member</h2>
        {error && (
          <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>
            {error}
          </p>
        )}
        <div className='flex gap-3'>
          <input
            type='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value='manager'>Manager</option>
            <option value='admin'>Admin</option>
          </select>
          <button
            type='button'
            onClick={handleInvite}
            disabled={isPending || !email}
            className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition'
          >
            {isPending ? 'Sending...' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800'>
        {members.length === 0 && (
          <p className='text-sm text-zinc-500 px-5 py-8 text-center'>
            No members yet.
          </p>
        )}
        {members.map((member) => (
          <div
            key={member.id}
            className='flex items-center justify-between px-5 py-4 gap-4'
          >
            <div className='flex items-center gap-3 min-w-0'>
              <div className='w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0'>
                {(member.userName ?? member.invitedEmail)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className='min-w-0'>
                {member.userName && (
                  <p className='text-sm font-medium text-white truncate'>
                    {member.userName}
                  </p>
                )}
                <p className='text-sm text-zinc-400 truncate'>
                  {member.invitedEmail}
                </p>
              </div>
              {member.inviteStatus === 'pending' && (
                <span className='shrink-0 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5'>
                  Pending
                </span>
              )}
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              <select
                value={member.role}
                onChange={(e) =>
                  handleRoleChange(
                    member.id,
                    e.target.value as 'admin' | 'manager',
                  )
                }
                disabled={isPending}
                className='bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
              >
                <option value='manager'>Manager</option>
                <option value='admin'>Admin</option>
              </select>
              <button
                type='button'
                onClick={() => handleRemove(member.id)}
                disabled={isPending}
                className='text-xs text-zinc-500 hover:text-red-400 disabled:opacity-40 transition'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
