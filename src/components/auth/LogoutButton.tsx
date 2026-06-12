'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton({ variant = 'default', redirectTo = '/login' }: { variant?: 'default' | 'icon'; redirectTo?: string } = {}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={signOut}
        className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#000D32] shadow-sm transition hover:bg-slate-50"
        aria-label="Sign out"
      >
        <LogOut className="size-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span>Sign out</span>
    </button>
  );
}
