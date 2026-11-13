-- Two locations, chosen by weekday (with optional one-off date overrides).
-- Run in the Supabase SQL editor.

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  postcode_city text not null,
  maps_url text,            -- optional; if empty the app builds a Google Maps search link
  sort int not null default 0
);

alter table public.locations enable row level security;
drop policy if exists "public read locations" on public.locations;
create policy "public read locations" on public.locations for select using (true);

insert into public.locations (slug, name, address, postcode_city, sort) values
  ('mehringdamm', 'Your Place Hair Studio', 'Mehringdamm 79', '10965 Berlin', 1),
  ('carlsgarten', 'Am Carlsgarten', 'Am Carlsgarten 7', '10318 Berlin', 2)
on conflict (slug) do nothing;

-- Each weekday is tied to a location.
alter table public.working_hours
  add column if not exists location_id uuid references public.locations(id);

update public.working_hours set location_id = (select id from public.locations where slug = 'mehringdamm')
  where weekday in (2, 3, 6);           -- Tue, Wed, Sat
update public.working_hours set location_id = (select id from public.locations where slug = 'carlsgarten')
  where weekday in (0, 1, 4, 5);        -- Sun, Mon, Thu, Fri

-- The barber now works every day; Sunday and Monday were closed in the first seed.
update public.working_hours set is_open = true where weekday in (0, 1);

-- One-off swaps: "on this date use that location instead".
create table if not exists public.location_overrides (
  date date primary key,
  location_id uuid not null references public.locations(id) on delete cascade
);
alter table public.location_overrides enable row level security;   -- no policies: server only

-- Remember where each booking happens, so the address stays right even if the schedule changes later.
alter table public.bookings
  add column if not exists location_id uuid references public.locations(id);
