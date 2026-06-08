'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminBookingCreateSchema, adminBookingUpdateSchema } from '@/lib/validations/booking';
import { createOrderId } from '@/features/bookings/whatsapp';
import { assertCanTransition } from '@/features/bookings/status-machine';

export async function updateBookingStatus(bookingId: string, status: string) {
  const profile = await requireRole(['admin', 'technician']);
  const supabase = await createServerSupabaseClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, order_id')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  assertCanTransition(booking.status, status, profile.role);

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
  revalidatePath(`/admin/bookings/${booking.order_id}`);
  revalidatePath('/admin/dashboard');
  revalidatePath('/technician/dashboard');
  revalidatePath(`/technician/jobs/${booking.order_id}`);
}

export async function assignTechnician(formData: FormData) {
  const profile = await requireRole(['admin']);
  const bookingId = String(formData.get('bookingId') || '');
  const technicianId = String(formData.get('technicianId') || '');

  if (!bookingId || !technicianId) throw new Error('Booking and technician are required.');

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, order_id')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  assertCanTransition(booking.status, 'assigned', profile.role);

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
  revalidatePath(`/admin/bookings/${booking.order_id}`);
  revalidatePath('/admin/dashboard');
}

export async function createAdminBooking(formData: FormData) {
  const profile = await requireRole(['admin']);
  const parsed = adminBookingCreateSchema.safeParse({
    customerName: String(formData.get('customerName') || ''),
    customerPhone: String(formData.get('customerPhone') || ''),
    address: String(formData.get('address') || ''),
    serviceId: String(formData.get('serviceId') || ''),
    preferredDate: String(formData.get('preferredDate') || ''),
    preferredTime: String(formData.get('preferredTime') || ''),
    notes: String(formData.get('notes') || ''),
    source: String(formData.get('source') || 'admin')
  });

  if (!parsed.success) {
    throw new Error('Please check the booking form and try again.');
  }

  const orderId = createOrderId();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      order_id: orderId,
      customer_name: parsed.data.customerName,
      customer_phone: parsed.data.customerPhone,
      address: parsed.data.address,
      service_id: parsed.data.serviceId || null,
      preferred_date: parsed.data.preferredDate,
      preferred_time: parsed.data.preferredTime,
      notes: parsed.data.notes || null,
      status: 'pending',
      source: parsed.data.source
    })
    .select('id')
    .single();

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: data.id,
    actor_id: profile.id,
    event_type: 'created',
    to_status: 'pending',
    note: `Booking created from ${parsed.data.source}.`
  });

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
  redirect(`/admin/bookings/${orderId}?created=1`);
}

export async function updateBookingFields(formData: FormData) {
  const profile = await requireRole(['admin']);
  const bookingId = String(formData.get('bookingId') || '');

  if (!bookingId) throw new Error('Booking is required.');

  const parsed = adminBookingUpdateSchema.safeParse({
    customerName: String(formData.get('customerName') || ''),
    customerPhone: String(formData.get('customerPhone') || ''),
    address: String(formData.get('address') || ''),
    serviceId: String(formData.get('serviceId') || ''),
    preferredDate: String(formData.get('preferredDate') || ''),
    preferredTime: String(formData.get('preferredTime') || ''),
    notes: String(formData.get('notes') || ''),
    finalPrice: String(formData.get('finalPrice') || '')
  });

  if (!parsed.success) {
    throw new Error('Please check the booking details and try again.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('order_id, status')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { error } = await supabase
    .from('bookings')
    .update({
      customer_name: parsed.data.customerName,
      customer_phone: parsed.data.customerPhone,
      address: parsed.data.address,
      service_id: parsed.data.serviceId || null,
      preferred_date: parsed.data.preferredDate,
      preferred_time: parsed.data.preferredTime,
      notes: parsed.data.notes || null,
      final_price: parsed.data.finalPrice === '' ? null : parsed.data.finalPrice,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'updated',
    from_status: booking.status,
    to_status: booking.status,
    note: 'Booking details updated.'
  });

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${booking.order_id}`);
  revalidatePath('/admin/dashboard');
}

export async function deleteBooking(formData: FormData) {
  const profile = await requireRole(['admin']);
  const bookingId = String(formData.get('bookingId') || '');

  if (!bookingId) throw new Error('Booking is required.');

  const supabase = await createServerSupabaseClient();
  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'deleted',
    note: 'Booking deleted by admin.'
  });

  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
  if (error) throw error;

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
  redirect('/admin/bookings?deleted=1');
}
