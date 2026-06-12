import { NextResponse } from 'next/server';
import { createOrderId, createWhatsAppUrl } from '@/features/bookings/whatsapp';
import { bookingRequestSchema, type BookingRequestInput } from '@/lib/validations/booking';
import { createServiceClient } from '@/lib/supabase/server';
import { services } from '@/data/services';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid booking request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const orderId = createOrderId();
  const whatsappUrl = createWhatsAppUrl(parsed.data, orderId);

  try {
    const supabase = createServiceClient();
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
        notes: buildBookingNotes(parsed.data),
        status: 'pending',
        source: parsed.data.source || 'website'
      })
      .select('id')
      .single();

    if (error) throw error;

    await supabase.from('booking_events').insert({
      booking_id: data.id,
      event_type: 'created',
      note: 'Booking created from public website.'
    });

    return NextResponse.json({ orderId, bookingId: data.id, whatsappUrl });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        orderId,
        whatsappUrl,
        warning: 'Supabase is not configured; returning WhatsApp URL only for local development.'
      });
    }

    return NextResponse.json({ error: 'Booking could not be saved.' }, { status: 500 });
  }
}

function buildBookingNotes(input: BookingRequestInput) {
  const service = input.serviceId ? services.find((item) => item.id === input.serviceId) : null;
  const details = [
    'Website booking details:',
    `Service: ${service?.title || input.serviceId || 'General Inquiry'}`,
    `Quantity: ${input.quantity || 1}`,
    ...(input.applianceType ? [`Appliance type: ${input.applianceType}`] : []),
    ...(input.applianceCapacity ? [`Appliance details: ${input.applianceCapacity}`] : []),
    ...(input.selectedAddons?.length ? [`Add-ons: ${input.selectedAddons.join(', ')}`] : []),
    ...(input.estimatedPrice ? [`Estimated price: BDT ${input.estimatedPrice}`] : [])
  ];
  const customerNote = input.notes?.trim();

  return customerNote ? `${details.join('\n')}\n\nCustomer note:\n${customerNote}` : details.join('\n');
}
