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
  updated_at?: string | null;
  completed_at?: string | null;
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
  },
  {
    id: 'mock-4',
    order_id: 'LSC-260612-M4R8',
    customer_name: 'Shahidur Shakil',
    customer_phone: '01605564270',
    address: 'Dhanmondi, Dhaka',
    service_id: 'washing-machine',
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_time: '10:30 AM',
    status: 'in_progress',
    source: 'website',
    assigned_technician_id: 'mock-tech-1',
    final_price: 850,
    notes: 'Customer requested technician to call before arrival.',
    created_at: new Date().toISOString(),
    services: { title: 'Washing Machine Regular Check Up' }
  },
  {
    id: 'mock-5',
    order_id: 'LSC-260612-Z8X2',
    customer_name: 'Rahat Khan',
    customer_phone: '01711223344',
    address: 'Uttara, Dhaka',
    service_id: 'ac-install',
    preferred_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    preferred_time: '2:00 PM',
    status: 'completed',
    source: 'admin',
    assigned_technician_id: 'mock-tech-1',
    final_price: 2500,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    services: { title: 'AC Installation' }
  }
];

const activeTechnicianStatuses = ['assigned', 'accepted', 'on_the_way', 'in_progress'];

export type AdminBookingListOptions = {
  page?: number;
  pageSize?: number;
  status?: string;
  unassigned?: boolean;
  query?: string;
};

export async function getAdminBookings(options: AdminBookingListOptions = {}) {
  if (!hasSupabaseConfig()) {
    return filterMockBookings(mockBookings, options).slice(
      ((options.page || 1) - 1) * (options.pageSize || 50),
      (options.page || 1) * (options.pageSize || 50)
    );
  }

  const supabase = await createServerSupabaseClient();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(Math.max(options.pageSize || 50, 1), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  query = applyBookingFilters(query, options);

  const { data, error } = await query;

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getBookingQueueCounts(searchQuery = '') {
  if (!hasSupabaseConfig()) {
    const searchableBookings = filterMockBookings(mockBookings, { query: searchQuery });

    return {
      all: searchableBookings.length,
      pending: searchableBookings.filter((booking) => booking.status === 'pending').length,
      ready: searchableBookings.filter((booking) => booking.status === 'confirmed' && !booking.assigned_technician_id).length,
      field: searchableBookings.filter((booking) => activeTechnicianStatuses.includes(booking.status)).length,
      completed: searchableBookings.filter((booking) => booking.status === 'completed').length,
      cancelled: searchableBookings.filter((booking) => booking.status === 'cancelled').length
    };
  }

  const supabase = await createServerSupabaseClient();
  const [all, pending, ready, assigned, accepted, onTheWay, inProgress, completed, cancelled] = await Promise.all([
    countBookings(supabase, { query: searchQuery }),
    countBookings(supabase, { status: 'pending', query: searchQuery }),
    countBookings(supabase, { status: 'confirmed', unassigned: true, query: searchQuery }),
    countBookings(supabase, { status: 'assigned', query: searchQuery }),
    countBookings(supabase, { status: 'accepted', query: searchQuery }),
    countBookings(supabase, { status: 'on_the_way', query: searchQuery }),
    countBookings(supabase, { status: 'in_progress', query: searchQuery }),
    countBookings(supabase, { status: 'completed', query: searchQuery }),
    countBookings(supabase, { status: 'cancelled', query: searchQuery })
  ]);

  return {
    all,
    pending,
    ready,
    field: assigned + accepted + onTheWay + inProgress,
    completed,
    cancelled
  };
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
    return mockBookings.filter((booking) => activeTechnicianStatuses.includes(booking.status) && (!booking.assigned_technician_id || booking.assigned_technician_id === 'mock-tech-1'));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', profileId)
    .in('status', activeTechnicianStatuses)
    .order('preferred_date', { ascending: true });

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getTechnicianAllJobs(profileId?: string, limit = 100) {
  if (!hasSupabaseConfig() || !profileId) {
    return sortTechnicianJobs(mockBookings.filter((booking) => booking.assigned_technician_id === 'mock-tech-1')).slice(0, limit);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', profileId)
    .order('preferred_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return sortTechnicianJobs(await hydrateBookings((data || []) as BookingRow[]));
}

export async function getTechnicianCompletedJobs(profileId?: string, limit = 20) {
  if (!hasSupabaseConfig() || !profileId) {
    return mockBookings.filter((booking) => booking.status === 'completed');
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', profileId)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getAdminTechnicianJobs(technicianId: string, limit = 50) {
  if (!hasSupabaseConfig()) {
    return mockBookings.filter((booking) => booking.assigned_technician_id === technicianId);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_technician_id', technicianId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return hydrateBookings((data || []) as BookingRow[]);
}

export async function getDashboardStats() {
  if (!hasSupabaseConfig()) {
    const bookings = await getAdminBookings();

    return {
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      readyToAssign: bookings.filter((booking) => booking.status === 'confirmed' && !booking.assigned_technician_id).length,
      assigned: bookings.filter((booking) => booking.status === 'assigned').length,
      fieldActive: bookings.filter((booking) => activeTechnicianStatuses.includes(booking.status)).length,
      completed: bookings.filter((booking) => booking.status === 'completed').length,
      cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
      total: bookings.length
    };
  }

  const supabase = await createServerSupabaseClient();
  const [total, pending, confirmed, readyToAssign, assigned, accepted, onTheWay, inProgress, completed, cancelled] = await Promise.all([
    countBookings(supabase),
    countBookings(supabase, { status: 'pending' }),
    countBookings(supabase, { status: 'confirmed' }),
    countBookings(supabase, { status: 'confirmed', unassigned: true }),
    countBookings(supabase, { status: 'assigned' }),
    countBookings(supabase, { status: 'accepted' }),
    countBookings(supabase, { status: 'on_the_way' }),
    countBookings(supabase, { status: 'in_progress' }),
    countBookings(supabase, { status: 'completed' }),
    countBookings(supabase, { status: 'cancelled' })
  ]);

  return {
    pending,
    confirmed,
    readyToAssign,
    assigned,
    fieldActive: assigned + accepted + onTheWay + inProgress,
    completed,
    cancelled,
    total
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

async function countBookings(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  options: Pick<AdminBookingListOptions, 'status' | 'unassigned' | 'query'> = {}
) {
  let query = supabase.from('bookings').select('id', { count: 'exact', head: true });

  query = applyBookingFilters(query, options);

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

function applyBookingFilters<QueryBuilder extends { eq: (column: string, value: string) => QueryBuilder; is: (column: string, value: null) => QueryBuilder; or: (filters: string) => QueryBuilder }>(
  query: QueryBuilder,
  options: Pick<AdminBookingListOptions, 'status' | 'unassigned' | 'query'>
) {
  if (options.status && options.status !== 'all') {
    if (options.status === 'field') {
      query = query.or(activeTechnicianStatuses.map((status) => `status.eq.${status}`).join(','));
    } else {
      query = query.eq('status', options.status);
    }
  }

  if (options.unassigned) query = query.is('assigned_technician_id', null);

  const search = sanitizeSearch(options.query || '');
  if (search) {
    query = query.or(
      [
        `order_id.ilike.%${search}%`,
        `customer_name.ilike.%${search}%`,
        `customer_phone.ilike.%${search}%`,
        `address.ilike.%${search}%`,
        `status.ilike.%${search}%`,
        `source.ilike.%${search}%`
      ].join(',')
    );
  }

  return query;
}

function filterMockBookings(bookings: BookingRow[], options: AdminBookingListOptions) {
  const search = sanitizeSearch(options.query || '').toLowerCase();

  return bookings.filter((booking) => {
    const matchesStatus =
      !options.status ||
      options.status === 'all' ||
      (options.status === 'field' ? activeTechnicianStatuses.includes(booking.status) : booking.status === options.status);
    const matchesUnassigned = options.unassigned ? !booking.assigned_technician_id : true;
    const searchableText = [
      booking.order_id,
      booking.customer_name,
      booking.customer_phone,
      booking.address,
      booking.services?.title,
      booking.service_id,
      booking.status,
      booking.source
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return matchesStatus && matchesUnassigned && (!search || searchableText.includes(search));
  });
}

function sanitizeSearch(value: string) {
  return value.replace(/[,%]/g, ' ').trim();
}

function sortTechnicianJobs(bookings: BookingRow[]) {
  const priority: Record<string, number> = {
    in_progress: 0,
    on_the_way: 1,
    accepted: 2,
    assigned: 3,
    completed: 4,
    cancelled: 5
  };

  return [...bookings].sort((a, b) => {
    const priorityDiff = (priority[a.status] ?? 6) - (priority[b.status] ?? 6);
    if (priorityDiff !== 0) return priorityDiff;

    const aDate = new Date(a.preferred_date || a.updated_at || a.created_at).getTime();
    const bDate = new Date(b.preferred_date || b.updated_at || b.created_at).getTime();
    return a.status === 'completed' ? bDate - aDate : aDate - bDate;
  });
}
