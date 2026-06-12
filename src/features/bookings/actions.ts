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
    .select('status, order_id, assigned_technician_id')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  if (profile.role === 'technician' && booking.assigned_technician_id !== profile.id) {
    throw new Error('This job is not assigned to your technician profile.');
  }

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

  revalidateBookingSurfaces(booking.order_id, booking.assigned_technician_id);
}

export async function completeTechnicianJob(formData: FormData) {
  const profile = await requireRole(['technician']);
  const bookingId = String(formData.get('bookingId') || '');
  const finalPriceValue = String(formData.get('finalPrice') || '').trim();
  const completionNote = String(formData.get('completionNote') || '').trim();
  const priceChangeReason = String(formData.get('priceChangeReason') || '').trim();

  if (!bookingId) throw new Error('Booking is required.');
  if (!completionNote) throw new Error('A completion note is required.');

  const finalPrice = finalPriceValue ? Number(finalPriceValue) : null;
  if (finalPrice !== null && (!Number.isFinite(finalPrice) || finalPrice <= 0)) {
    throw new Error('Final price must be a positive number.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, order_id, assigned_technician_id, notes, final_price')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  if (booking.assigned_technician_id !== profile.id) {
    throw new Error('This job is not assigned to your technician profile.');
  }
  if (!finalPrice && !booking.final_price) {
    throw new Error('Final price is required before completing this job.');
  }

  assertCanTransition(booking.status, 'completed', profile.role);

  const resolvedFinalPrice = finalPrice ?? booking.final_price ?? null;
  const previousFinalPrice = booking.final_price || null;
  const priceChanged = Boolean(previousFinalPrice && resolvedFinalPrice && previousFinalPrice !== resolvedFinalPrice);
  if (priceChanged && !priceChangeReason) {
    throw new Error('Please add a reason when the final price changes.');
  }

  const noteLine = [
    `Technician completion note: ${completionNote}`,
    priceChanged && priceChangeReason ? `Price change reason: ${priceChangeReason}` : null
  ].filter(Boolean).join('\n');
  const updatedNotes = booking.notes ? `${booking.notes}\n\n${noteLine}` : noteLine;

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      final_price: resolvedFinalPrice,
      notes: updatedNotes,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'status_changed',
    from_status: booking.status,
    to_status: 'completed',
    note: `Job completed. Final price: ${resolvedFinalPrice ? `BDT ${resolvedFinalPrice}` : 'not set'}. ${completionNote}`
  });

  revalidateBookingSurfaces(booking.order_id, profile.id);
  redirect(`/technician/jobs/${booking.order_id}/receipt?completed=1`);
}

export async function rescheduleTechnicianJob(formData: FormData) {
  const profile = await requireRole(['technician']);
  const bookingId = String(formData.get('bookingId') || '');
  const preferredDate = String(formData.get('preferredDate') || '').trim();
  const preferredTime = String(formData.get('preferredTime') || '').trim();
  const rescheduleReason = String(formData.get('rescheduleReason') || '').trim();
  const rescheduleDetails = String(formData.get('rescheduleDetails') || '').trim();
  const rescheduleNote = String(formData.get('rescheduleNote') || rescheduleReason || '').trim();

  if (!bookingId || !preferredDate || !preferredTime) {
    throw new Error('Booking, date, and time are required.');
  }

  if (!rescheduleNote) {
    throw new Error('A reschedule reason is required.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, order_id, assigned_technician_id, preferred_date, preferred_time, notes')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  if (booking.assigned_technician_id !== profile.id) {
    throw new Error('This job is not assigned to your technician profile.');
  }
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new Error('Completed or cancelled jobs cannot be rescheduled.');
  }

  const reasonText = [rescheduleNote, rescheduleDetails].filter(Boolean).join('. ');
  const noteLine = `Technician reschedule note: ${booking.preferred_date} / ${booking.preferred_time} moved to ${preferredDate} / ${preferredTime}. Reason: ${reasonText}`;
  const updatedNotes = booking.notes ? `${booking.notes}\n\n${noteLine}` : noteLine;

  const { error } = await supabase
    .from('bookings')
    .update({
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'rescheduled',
    from_status: booking.status,
    to_status: booking.status,
    note: noteLine
  });

  revalidateBookingSurfaces(booking.order_id, profile.id);
  redirect(`/technician/jobs/${booking.order_id}?rescheduled=1`);
}

export async function addTechnicianJobNote(formData: FormData) {
  const profile = await requireRole(['technician']);
  const bookingId = String(formData.get('bookingId') || '');
  const noteType = String(formData.get('noteType') || 'field_note').trim();
  const note = String(formData.get('technicianNote') || '').trim();

  if (!bookingId || !note) {
    throw new Error('Booking and note are required.');
  }

  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, order_id, assigned_technician_id, notes')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  if (booking.assigned_technician_id !== profile.id) {
    throw new Error('This job is not assigned to your technician profile.');
  }
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new Error('Completed or cancelled jobs cannot be updated.');
  }

  const readableType = noteType.replaceAll('_', ' ');
  const noteLine = `Technician ${readableType}: ${note}`;
  const updatedNotes = booking.notes ? `${booking.notes}\n\n${noteLine}` : noteLine;

  const { error } = await supabase
    .from('bookings')
    .update({
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: profile.id,
    event_type: 'technician_note',
    from_status: booking.status,
    to_status: booking.status,
    note: noteLine
  });

  revalidateBookingSurfaces(booking.order_id, profile.id);
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

  revalidateBookingSurfaces(booking.order_id, technicianId);
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
    source: String(formData.get('source') || 'admin'),
    createStatus: String(formData.get('createStatus') || 'pending')
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
      status: parsed.data.createStatus,
      source: parsed.data.source,
      ...(parsed.data.createStatus === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {})
    })
    .select('id')
    .single();

  if (error) throw error;

  await supabase.from('booking_events').insert({
    booking_id: data.id,
    actor_id: profile.id,
    event_type: 'created',
    to_status: parsed.data.createStatus,
    note: `Booking created from ${parsed.data.source} as ${parsed.data.createStatus}.`
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

  revalidateBookingSurfaces(booking.order_id);
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

function revalidateBookingSurfaces(orderId: string, technicianId?: string | null) {
  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${orderId}`);
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/technicians');
  if (technicianId) revalidatePath(`/admin/technicians/${technicianId}`);
  revalidatePath('/technician/dashboard');
  revalidatePath('/technician/jobs');
  revalidatePath('/technician/alerts');
  revalidatePath('/technician/jobs?view=delayed');
  revalidatePath(`/technician/jobs/${orderId}`);
  revalidatePath(`/technician/jobs/${orderId}/receipt`);
}
