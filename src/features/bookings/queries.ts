import { hasSupabaseConfig } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { services } from '@/data/services';

export interface BookingRow {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  service_id: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  source: string;
  assigned_technician_id: string | null;
  created_at: string;
  notes?: string | null;
  final_price?: number | null;
  confirmed_at?: string | null;
  assigned_at?: string | null;
  services?: {
    title: string;
  } | null;
  technician_profiles?: {
    display_name: string;
    phone: string;
  } | null;
}

export interface BookingEventRow {
  id: string;
  booking_id: string;
  actor_id: string | null;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    role: string;
  } | null;
}

const mockBookings: BookingRow[] = [
  {
    id: 'mock-1',
    order_id: 'LSC-260607-A1B2',
    customer_name: 'Rahim Uddin',
    customer_phone: '01700000000',
    address: 'Mirpur, Dhaka',
    service_id: 'ac-jet',
    preferred_date: '2026-06-08',
    preferred_time: 'Morning (9AM - 12PM)',
    status: 'pending',
    source: 'website',
    assigned_technician_id: null,
    created_at: new Date().toISOString(),
    services: { title: 'AC Jet Wash' }
  },
  {
    id: 'mock-2',
    order_id: 'LSC-260607-C8D1',
    customer_name: 'Nusrat Jahan',
    customer_phone: '01800000000',
    address: 'Banani, Dhaka',
    service_id: 'fridge-checkup',
    preferred_date: '2026-06-08',
    preferred_time: 'Afternoon (12PM - 4PM)',
    status: 'confirmed',
    source: 'website',
    assigned_technician_id: null,
    created_at: new Date().toISOString(),
    services: { title: 'Fridge Checkup' }
  },
  {
    id: 'mock-3',
    order_id: 'LSC-260607-K9Q4',
    customer_name: 'Karim Mia',
    customer_phone: '01900000000',
    address: 'Mohakhali, Dhaka',
    service_id: 'geyser-install',
    preferred_date: '2026-06-08',
    preferred_time: 'Evening (4PM - 8PM)',
    status: 'assigned',
    source: 'website',
    assigned_technician_id: 'mock-tech-1',
    created_at: new Date().toISOString(),
    services: { title: 'Geyser Installation' }
  }
];

export async function getAdminBookings() {
  if (!hasSupabaseConfig()) return mockBookings;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getBookingByOrderId(orderId: string) {
  if (!hasSupabaseConfig()) {
    return mockBookings.find((booking) => booking.order_id === orderId || booking.id === orderId) || mockBookings[0];
  }

  const supabase = await createServerSupabaseClient();
  const query = supabase
    .from('bookings')
    .select('*');

  const { data, error } = isUuid(orderId)
    ? await query.eq('id', orderId).single()
    : await query.eq('order_id', orderId).single();

  if (error) throw error;
  const [booking] = await hydrateBookings([data as BookingRow]);
  return booking;
}

export async function getTechnicianBookingByOrderId(orderId: string, technicianId: string) {
  if (!hasSupabaseConfig()) {
    return mockBookings.find((booking) => booking.order_id === orderId || booking.id === orderId) || mockBookings[0];
  }

  const supabase = await createServerSupabaseClient();
  const query = supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', technicianId);

  const { data, error } = isUuid(orderId)
    ? await query.eq('id', orderId).single()
    : await query.eq('order_id', orderId).single();

  if (error) throw error;
  const [booking] = await hydrateBookings([data as BookingRow]);
  return booking;
}

export async function getTechnicianJobs(profileId?: string) {
  if (!hasSupabaseConfig() || !profileId) {
    return mockBookings.filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', profileId)
    .in('status', ['assigned', 'accepted', 'on_the_way', 'in_progress'])
    .order('preferred_date', { ascending: true });

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getDashboardStats() {
  const bookings = await getAdminBookings();

  return {
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    assigned: bookings.filter((booking) => booking.status === 'assigned').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
    total: bookings.length
  };
}

export async function getBookingEvents(bookingId: string) {
  if (!hasSupabaseConfig()) {
    return [
      {
        id: 'mock-event-1',
        booking_id: bookingId,
        actor_id: null,
        event_type: 'created',
        from_status: null,
        to_status: 'pending',
        note: 'Booking created from website.',
        created_at: new Date().toISOString(),
        profiles: null
      }
    ] satisfies BookingEventRow[];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('booking_events')
    .select('*, profiles(full_name, role)')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('booking_events')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (fallbackError) return [];
    return (fallbackData || []) as BookingEventRow[];
  }

  return (data || []) as BookingEventRow[];
}

export async function getServicesForSelect() {
  if (!hasSupabaseConfig()) {
    return services.map((service) => ({ id: service.id, title: service.title }));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, title')
    .eq('is_active', true)
    .order('title', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function hydrateBookings(bookings: BookingRow[]) {
  if (!bookings.length || !hasSupabaseConfig()) return bookings;

  const supabase = await createServerSupabaseClient();
  const serviceIds = Array.from(new Set(bookings.map((booking) => booking.service_id).filter(Boolean))) as string[];
  const technicianIds = Array.from(new Set(bookings.map((booking) => booking.assigned_technician_id).filter(Boolean))) as string[];

  const [servicesResult, techniciansResult] = await Promise.all([
    serviceIds.length
      ? supabase.from('services').select('id, title').in('id', serviceIds)
      : Promise.resolve({ data: [], error: null }),
    technicianIds.length
      ? supabase.from('technician_profiles').select('id, display_name, phone').in('id', technicianIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  const serviceMap = new Map((servicesResult.data || []).map((service) => [service.id, service]));
  const technicianMap = new Map((techniciansResult.data || []).map((technician) => [technician.id, technician]));

  return bookings.map((booking) => ({
    ...booking,
    services: booking.service_id ? { title: serviceMap.get(booking.service_id)?.title || booking.service_id } : null,
    technician_profiles: booking.assigned_technician_id
      ? {
          display_name: technicianMap.get(booking.assigned_technician_id)?.display_name || 'Assigned technician',
          phone: technicianMap.get(booking.assigned_technician_id)?.phone || ''
        }
      : null
  }));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
