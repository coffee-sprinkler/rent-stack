'use client';
// app/(auth)/verify-email/page.tsx
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const success = params.get('success') === 'true';
  const error = params.get('error');
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

  if (success) {
    return (
      <div className='text-center'>
        <p className='text-5xl mb-4'>✅</p>
        <h1 className='text-2xl font-bold mb-2'>Email verified!</h1>
        <p className='text-zinc-400 text-sm mb-6'>
          Your account is now fully active.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className='bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition'
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (error === 'expired') {
    return (
      <div className='text-center'>
        <p className='text-5xl mb-4'>⏰</p>
        <h1 className='text-2xl font-bold mb-2'>Link expired</h1>
        <p className='text-zinc-400 text-sm mb-6'>
          Your verification link has expired. Request a new one.
        </p>
        <button
          onClick={handleResend}
          disabled={resending || resent}
          className='bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition'
        >
          {resent
            ? '✓ Sent!'
            : resending
              ? 'Sending…'
              : 'Resend verification email'}
        </button>
      </div>
    );
  }

  // Default — just registered, waiting for verification
  return (
    <div className='text-center'>
      <p className='text-5xl mb-4'>📬</p>
      <h1 className='text-2xl font-bold mb-2'>Check your email</h1>
      <p className='text-zinc-400 text-sm mb-2'>
        We sent a verification link to your email address.
      </p>
      <p className='text-zinc-600 text-xs mb-6'>
        Click the link to verify your account. Some features are limited until
        you verify.
      </p>
      <div className='space-y-3'>
        {resent ? (
          <p className='text-emerald-400 text-sm'>
            ✓ New verification email sent!
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className='text-sm text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50'
          >
            {resending ? 'Sending…' : "Didn't receive it? Resend"}
          </button>
        )}
        <div>
          <Link
            href='/dashboard'
            className='text-xs text-zinc-500 hover:text-white transition'
          >
            Continue to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4'>
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-10 w-full max-w-md'>
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
