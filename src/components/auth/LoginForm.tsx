'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({
  allowedRole,
  fallbackPath
}: {
  allowedRole?: 'admin' | 'technician';
  fallbackPath?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storageKey = useMemo(() => `lucky:${allowedRole || 'staff'}:last-email`, [allowedRole]);
  const [emailValue, setEmailValue] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(storageKey) || '';
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.localStorage.setItem(storageKey, email);

    const profileResponse = await fetch('/api/auth/profile', {
      cache: 'no-store'
    });
    const profilePayload = (await profileResponse.json().catch(() => ({}))) as {
      profile?: {
        role: 'admin' | 'technician' | 'customer';
        status: string;
      };
      error?: string;
    };

    if (!profileResponse.ok || !profilePayload.profile) {
      await supabase.auth.signOut();
      setError(profilePayload.error || 'Staff profile could not be resolved.');
      setLoading(false);
      return;
    }

    if (allowedRole && profilePayload.profile.role !== allowedRole) {
      await supabase.auth.signOut();
      setError(allowedRole === 'admin' ? 'Please use an admin account.' : 'Please use a technician account.');
      setLoading(false);
      return;
    }

    const requestedNext = searchParams.get('next');
    const next =
      allowedRole === 'admin'
        ? requestedNext?.startsWith('/admin') ? requestedNext : null
        : allowedRole === 'technician'
          ? requestedNext?.startsWith('/technician') ? requestedNext : null
          : requestedNext;
    const roleFallbackPath = fallbackPath || (profilePayload.profile.role === 'technician' ? '/technician/dashboard' : '/admin/dashboard');

    router.push(next || roleFallbackPath);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-700">Email</label>
        <input
          required
          name="email"
          type="email"
          value={emailValue}
          suppressHydrationWarning
          onChange={(event) => setEmailValue(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:ring-2 focus:ring-[#2EA9D6]/20"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-700">Password</label>
        <input
          required
          name="password"
          type="password"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:ring-2 focus:ring-[#2EA9D6]/20"
          placeholder="••••••••"
        />
      </div>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p> : null}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-[#2EA9D6] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2EA9D6]/20 disabled:opacity-70"
      >
        {loading ? 'Signing in...' : emailValue ? 'Sign in with saved email' : 'Sign In'}
      </button>
    </form>
  );
}
