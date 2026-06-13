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
        <label className="mb-2 block text-sm font-semibold text-[#191C1E]">Email</label>
        <input
          required
          name="email"
          type="email"
          value={emailValue}
          suppressHydrationWarning
          onChange={(event) => setEmailValue(event.target.value)}
          className="w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] px-4 py-3.5 font-medium text-[#000D32] outline-none transition focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#191C1E]">Password</label>
        <input
          required
          name="password"
          type="password"
          className="w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] px-4 py-3.5 font-medium text-[#000D32] outline-none transition focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10"
          placeholder="••••••••"
        />
      </div>
      {error ? <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <button
        disabled={loading}
        className="w-full rounded bg-[#000D32] py-3.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)] transition hover:bg-[#12234D] disabled:opacity-70"
      >
        {loading ? 'Signing in...' : emailValue ? 'Sign in with saved email' : 'Sign In'}
      </button>
    </form>
  );
}
