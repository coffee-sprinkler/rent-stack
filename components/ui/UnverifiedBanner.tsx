'use client';
// components/ui/UnverifiedBanner.tsx

import { useState } from 'react';

export default function UnverifiedBanner() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', { method: 'POST' });
      setResent(true);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className='bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between gap-4'>
      <p className='text-amber-400 text-sm'>
        ⚠️ Your email is not verified. Some features are limited.
      </p>
      {resent ? (
        <p className='text-emerald-400 text-xs shrink-0'>✓ Email sent!</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending}
          className='text-xs text-amber-400 hover:text-white border border-amber-500/30 hover:border-amber-400 px-3 py-1.5 rounded-lg transition shrink-0 disabled:opacity-50'
        >
          {resending ? 'Sending…' : 'Resend verification'}
        </button>
      )}
    </div>
  );
}
