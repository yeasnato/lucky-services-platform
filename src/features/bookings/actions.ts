'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function updateBookingStatus(bookingId: string, status: string) {
  const profile = await requireRole(['admin', 'technician']);
  const supabase = await createServerSupabaseClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'status_changed',
    from_status: booking.status,
    to_status: status,
    note: `Status changed to ${status}.`
  });

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
  revalidatePath('/technician/dashboard');
}

export async function assignTechnician(formData: FormData) {
  const profile = await requireRole(['admin']);
  const bookingId = String(formData.get('bookingId') || '');
  const technicianId = String(formData.get('technicianId') || '');

  if (!bookingId || !technicianId) throw new Error('Booking and technician are required.');

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { error } = await supabase
    .from('bookings')
    .update({
      assigned_technician_id: technicianId,
      status: 'assigned',
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'technician_assigned',
    from_status: booking.status,
    to_status: 'assigned',
    note: `Technician assigned: ${technicianId}.`
  });

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
}
