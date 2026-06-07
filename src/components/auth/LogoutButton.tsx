'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={signOut} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#0B2A4A]">
      Sign out
    </button>
  );
}
