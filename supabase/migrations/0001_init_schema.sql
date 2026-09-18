-- =====================================================================
-- 0001_init_schema.sql
-- Initial schema for Dolania (Explore Curug Banyumas)
-- =====================================================================

-- Required for gen_random_uuid() on Supabase (enabled by default, safe to re-run)
create extension if not exists pgcrypto;

-- =====================================================================
-- 1. profiles
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'participant'
    check (role in ('admin', 'participant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 2. curugs
-- =====================================================================
create table if not exists public.curugs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  alt_name text,
  slug text not null unique,
  short_description text,
  long_description text,
  village text,
  district text,
  destination_type text not null default 'curug'
    check (destination_type in ('curug', 'gunung', 'bukit', 'pantai', 'air_terjun', 'lainnya')),
  latitude numeric,
  longitude numeric,
  google_maps_url text,
  difficulty text
    check (difficulty in ('mudah', 'menengah', 'sulit')),
  trek_duration_minutes integer,
  distance_from_city_km numeric,
  ticket_price integer not null default 0,
  parking_price integer not null default 0,
  best_time_to_visit text,
  facilities jsonb not null default '[]'::jsonb,
  access_notes text,
  tags jsonb not null default '[]'::jsonb,
  cover_image_url text,
  gallery jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 3. articles
-- =====================================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 4. trips
-- =====================================================================
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  itinerary text,
  trip_type text not null
    check (trip_type in ('public', 'private')),
  trip_date date not null,
  meeting_point text,
  meeting_time time,
  price_per_person integer not null,
  max_participants integer not null,
  status text not null default 'open'
    check (status in ('open', 'full', 'closed', 'cancelled')),
  terms_and_conditions text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 5. trip_curugs (pivot: trips <-> curugs)
-- =====================================================================
create table if not exists public.trip_curugs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  curug_id uuid not null references public.curugs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, curug_id)
);

-- =====================================================================
-- 6. features (master list of trip inclusions)
-- =====================================================================
create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  category text
    check (category in ('konsumsi', 'peralatan', 'layanan', 'lainnya')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 7. trip_features (pivot: trips <-> features)
-- =====================================================================
create table if not exists public.trip_features (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  custom_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, feature_id)
);

-- =====================================================================
-- 8. participants
-- =====================================================================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  total_people integer not null default 1,
  member_names jsonb not null default '[]'::jsonb,
  is_guest boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'waitlist')),
  private_trip_access_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- Indexes
-- =====================================================================
create index if not exists idx_curugs_slug on public.curugs(slug);
create index if not exists idx_curugs_destination_type on public.curugs(destination_type);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_trips_slug on public.trips(slug);

create index if not exists idx_participants_trip_id on public.participants(trip_id);
create index if not exists idx_trip_curugs_trip_id on public.trip_curugs(trip_id);
create index if not exists idx_trip_features_trip_id on public.trip_features(trip_id);

-- =====================================================================
-- updated_at trigger function + triggers
-- =====================================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.curugs;
create trigger set_updated_at
  before update on public.curugs
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.articles;
create trigger set_updated_at
  before update on public.articles
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.trips;
create trigger set_updated_at
  before update on public.trips
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.trip_curugs;
create trigger set_updated_at
  before update on public.trip_curugs
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.features;
create trigger set_updated_at
  before update on public.features
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.trip_features;
create trigger set_updated_at
  before update on public.trip_features
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at on public.participants;
create trigger set_updated_at
  before update on public.participants
  for each row execute function public.update_updated_at_column();
