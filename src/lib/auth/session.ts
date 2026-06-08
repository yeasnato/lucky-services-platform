import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/core';
import { hasSupabaseConfig } from '@/lib/supabase/config';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server';

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

  let data = null;

  try {
    const serviceClient = createServiceClient();
    const { data: serviceProfile } = await serviceClient.from('profiles').select('*').eq('id', user.id).single();
    data = serviceProfile;
  } catch {
    const { data: rlsProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    data = rlsProfile;
  }

  return data;
}

export async function requireRole(roles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(roles.includes('technician') && !roles.includes('admin') ? '/technician/login' : '/admin/login');
  }

  if (profile.status !== 'active') {
    redirect(roles.includes('technician') && !roles.includes('admin') ? '/technician/login' : '/admin/login');
  }

  if (!roles.includes(profile.role as UserRole)) {
    if (!hasSupabaseConfig() && process.env.NODE_ENV !== 'production') {
      return {
        ...profile,
        role: roles[0]
      };
    }

    if (profile.role === 'technician') redirect('/technician/dashboard');
    if (profile.role === 'admin') redirect('/admin/dashboard');
    redirect('/');
  }

  return profile;
}
