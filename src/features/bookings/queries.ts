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
    .select('*, services(title), technician_profiles(display_name, phone)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []) as BookingRow[];
}

export async function getBookingByOrderId(orderId: string) {
  if (!hasSupabaseConfig()) {
    return mockBookings.find((booking) => booking.order_id === orderId || booking.id === orderId) || mockBookings[0];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(title), technician_profiles(display_name, phone)')
    .or(`order_id.eq.${orderId},id.eq.${orderId}`)
    .single();

  if (error) throw error;
  return data as BookingRow;
}

export async function getTechnicianJobs(profileId?: string) {
  if (!hasSupabaseConfig() || !profileId) {
    return mockBookings.filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(title)')
    .eq('assigned_technician_id', profileId)
    .in('status', ['assigned', 'accepted', 'on_the_way', 'in_progress'])
    .order('preferred_date', { ascending: true });

  if (error) throw error;
  return (data || []) as BookingRow[];
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

  if (error) throw error;
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
