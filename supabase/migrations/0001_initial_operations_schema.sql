create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'technician', 'customer');
create type booking_status as enum (
  'pending',
  'confirmed',
  'assigned',
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_categories (
  id text primary key,
  title text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.services (
  id text primary key,
  category_id text not null references public.service_categories(id),
  slug text not null unique,
  title text not null,
  description text not null,
  base_price integer,
  price_label text,
  service_type text not null check (service_type in ('service', 'repair')),
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  created_at timestamptz not null default now(),
  unique (phone)
);

create table public.technician_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  phone text not null,
  availability_status text not null default 'available',
  rating numeric(3,2),
  created_at timestamptz not null default now()
);

create table public.technician_skills (
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  category_id text not null references public.service_categories(id),
  primary key (technician_id, category_id)
);

create table public.technician_service_areas (
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  area_id uuid not null references public.service_areas(id) on delete cascade,
  primary key (technician_id, area_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  service_id text references public.services(id),
  preferred_date date not null,
  preferred_time text not null,
  notes text,
  status booking_status not null default 'pending',
  source text not null default 'website',
  assigned_technician_id uuid references public.technician_profiles(id),
  final_price integer,
  confirmed_at timestamptz,
  assigned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  from_status booking_status,
  to_status booking_status,
  note text,
  created_at timestamptz not null default now()
);

create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'sms', 'email', 'in_app')),
  recipient text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.technician_profiles enable row level security;

create or replace function public.current_user_role()
returns user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles can view own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins can manage profiles"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "technicians can view own profile"
  on public.technician_profiles for select
  using (auth.uid() = id);

create policy "admins can manage technician profiles"
  on public.technician_profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "admins can manage all bookings"
  on public.bookings for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "technicians can view assigned bookings"
  on public.bookings for select
  using (assigned_technician_id = auth.uid());

create policy "technicians can update assigned bookings"
  on public.bookings for update
  using (assigned_technician_id = auth.uid())
  with check (assigned_technician_id = auth.uid());

create policy "admins can manage booking events"
  on public.booking_events for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "technicians can create events for assigned bookings"
  on public.booking_events for insert
  with check (
    actor_id = auth.uid()
    and exists (
      select 1
      from public.bookings
      where bookings.id = booking_events.booking_id
      and bookings.assigned_technician_id = auth.uid()
    )
  );

create policy "technicians can view events for assigned bookings"
  on public.booking_events for select
  using (
    exists (
      select 1
      from public.bookings
      where bookings.id = booking_events.booking_id
      and bookings.assigned_technician_id = auth.uid()
    )
  );

create index bookings_status_idx on public.bookings(status);
create index bookings_assigned_technician_idx on public.bookings(assigned_technician_id);
create index bookings_created_at_idx on public.bookings(created_at desc);
create index booking_events_booking_idx on public.booking_events(booking_id, created_at desc);
