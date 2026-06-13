'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';

export async function createTechnician(formData: FormData) {
  await requireRole(['admin']);

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const password = String(formData.get('password') || '');
  const primaryCategory = String(formData.get('primaryCategory') || '').trim();
  const serviceAreaId = String(formData.get('serviceAreaId') || '').trim();

  if (!fullName || !email || !phone || password.length < 8) {
    redirectWithError('Name, email, phone, and a minimum 8-character password are required.');
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    redirectWithError('Supabase service role key is missing in Vercel. Add SUPABASE_SERVICE_ROLE_KEY to Vercel Environment Variables.');
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'technician'
    }
  });

  if (error) {
    redirectWithError(error.message);
  }

  if (!data.user) {
    redirectWithError('Technician auth account could not be created.');
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    phone,
    role: 'technician',
    status: 'active'
  });

  if (profileError) {
    redirectWithError(profileError.message);
  }

  const { error: technicianError } = await supabase.from('technician_profiles').upsert({
    id: userId,
    display_name: fullName,
    phone,
    availability_status: 'available'
  });

  if (technicianError) {
    redirectWithError(technicianError.message);
  }

  if (primaryCategory) {
    const { error: skillError } = await supabase.from('technician_skills').upsert({
      technician_id: userId,
      category_id: primaryCategory
    });

    if (skillError) {
      redirectWithError(skillError.message);
    }
  }

  if (serviceAreaId) {
    const { error: areaError } = await supabase.from('technician_service_areas').upsert({
      technician_id: userId,
      area_id: serviceAreaId
    });

    if (areaError) {
      redirectWithError(areaError.message);
    }
  }

  revalidatePath('/admin/technicians');
  redirect('/admin/technicians?created=1');
}

export async function updateTechnicianAvailability(formData: FormData) {
  await requireRole(['admin']);

  const technicianId = String(formData.get('technicianId') || '');
  const availabilityStatus = String(formData.get('availabilityStatus') || '');
  const allowedStatuses = ['available', 'on_job', 'offline'];

  if (!technicianId || !allowedStatuses.includes(availabilityStatus)) {
    throw new Error('A valid technician and availability status are required.');
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    redirectWithError('Supabase service role key is missing in Vercel. Add SUPABASE_SERVICE_ROLE_KEY to Vercel Environment Variables.');
  }

  const { error } = await supabase
    .from('technician_profiles')
    .update({ availability_status: availabilityStatus })
    .eq('id', technicianId);

  if (error) throw error;

  revalidatePath('/admin/technicians');
  revalidatePath(`/admin/technicians/${technicianId}`);
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
}

function redirectWithError(message: string): never {
  redirect(`/admin/technicians?error=${encodeURIComponent(message)}`);
}
