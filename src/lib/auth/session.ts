import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/core';
import { hasSupabaseConfig } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getCurrentProfile() {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: 'mock-admin',
        full_name: 'Development Admin',
        phone: null,
        role: 'admin',
        status: 'active'
      };
    }

    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function requireRole(roles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  if (!roles.includes(profile.role as UserRole)) {
    if (!hasSupabaseConfig() && process.env.NODE_ENV !== 'production') {
      return {
        ...profile,
        role: roles[0]
      };
    }

    redirect('/');
  }

  return profile;
}
