'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

    const { data: profile } = await supabase.from('profiles').select('role').single();
    const next = searchParams.get('next');
    const fallbackPath = profile?.role === 'technician' ? '/technician/dashboard' : '/admin/dashboard';

    router.push(next || fallbackPath);
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
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
