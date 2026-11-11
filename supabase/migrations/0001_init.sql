-- GROOMS booking schema. Run in the Supabase SQL editor (or `supabase db push`).
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min int not null check (duration_min between 5 and 480),
  price_cents int check (price_cents >= 0),
  active boolean not null default true,
  sort int not null default 0
);

-- weekday: 0 = Sunday ... 6 = Saturday. Times are Europe/Berlin wall-clock.
create table public.working_hours (
  weekday int primary key check (weekday between 0 and 6),
  is_open boolean not null default false,
  open_time time not null default '10:00',
  close_time time not null default '19:00',
  break_start time,
  break_end time
);

create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  reason text,
  check (end_date >= start_date)
);

create table public.settings (
  id int primary key default 1 check (id = 1),
  slot_interval_min int not null default 15,
  min_notice_hours int not null default 2,
  max_days_ahead int not null default 60,
  cancel_cutoff_hours int not null default 12
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  notes text,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','completed','no_show')),
  manage_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  reminder_sent boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- single barber: no two confirmed bookings may overlap, enforced by the database
  constraint no_overlap exclude using gist (tstzrange(starts_at, ends_at) with &&) where (status = 'confirmed')
);
create index on public.bookings (starts_at);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  location text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- RLS: everything locked down; only public catalogue data is readable with the anon key.
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_off enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.waitlist enable row level security;

create policy "public read active services" on public.services for select using (active);
create policy "public read hours" on public.working_hours for select using (true);
create policy "public read settings" on public.settings for select using (true);
-- bookings, time_off, waitlist: no policies => only the service role (server routes) can touch them.

-- Seed data (edit in the admin dashboard afterwards)
insert into public.settings default values;
insert into public.working_hours (weekday, is_open, open_time, close_time, break_start, break_end) values
  (0, false, '10:00', '19:00', null, null),
  (1, false, '10:00', '19:00', null, null),
  (2, true,  '10:00', '19:00', '13:00', '14:00'),
  (3, true,  '10:00', '19:00', '13:00', '14:00'),
  (4, true,  '10:00', '19:00', '13:00', '14:00'),
  (5, true,  '10:00', '19:00', '13:00', '14:00'),
  (6, true,  '10:00', '18:00', null, null);
insert into public.services (name, description, duration_min, price_cents, sort) values
  ('Fade', 'Taper, mid, high, low, burst, cut clean to your hairline.', 45, null, 1),
  ('Lineup', 'Sharp edges, held sharp.', 20, null, 2),
  ('Beard Lineup & Grooming', 'Shaped and conditioned, not just trimmed.', 30, null, 3),
  ('Locs, Braids & Cornrows', 'Textured-hair work by specialists.', 90, null, 4);
