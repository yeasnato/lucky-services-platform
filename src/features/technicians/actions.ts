'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';

export async function createTechnician(formData: FormData) {
  await requireRole(['admin']);

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const password = String(formData.get('password') || '');

  if (!fullName || !email || !phone || password.length < 8) {
    throw new Error('Name, email, phone, and a minimum 8-character password are required.');
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'technician'
    }
  });

  if (error) throw error;
  const userId = data.user.id;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    phone,
    role: 'technician',
    status: 'active'
  });

  if (profileError) throw profileError;

  const { error: technicianError } = await supabase.from('technician_profiles').upsert({
    id: userId,
    display_name: fullName,
    phone,
    availability_status: 'available'
  });

  if (technicianError) throw technicianError;

  revalidatePath('/admin/technicians');
}
