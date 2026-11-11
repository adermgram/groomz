-- Admins are managed here: add a row (Table Editor or SQL) to grant /admin access.
-- The person must also exist under Authentication -> Users (that is their login).
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admins_email_lowercase check (email = lower(email))
);

-- RLS on with no policies: the public/anon key can never read or change this table.
-- Only the server (secret key) checks it.
alter table public.admins enable row level security;

-- Replace with your own admin email, then run:
-- insert into public.admins (email) values ('you@example.com');
