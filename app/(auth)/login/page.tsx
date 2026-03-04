'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm'>
        {/* Logo / Brand */}
        <div className='mb-10 text-center'>
          <h1 className='text-3xl font-bold text-white tracking-tight'>
            RentStack
          </h1>
          <p className='text-zinc-500 text-sm mt-2'>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-zinc-400 uppercase tracking-widest'>
                Email
              </label>
              <input
                type='email'
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder='you@example.com'
                className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-zinc-400 uppercase tracking-widest'>
                Password
              </label>
              <input
                type='password'
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder='••••••••'
                className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
              />
            </div>

            {error && (
              <p className='text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition'
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className='text-center text-zinc-600 text-sm mt-6'>
          Don&apos;t have an account?{' '}
          <Link
            href='/register'
            className='text-indigo-400 hover:text-indigo-300 transition'
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
