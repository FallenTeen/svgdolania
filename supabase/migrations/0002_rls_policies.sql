-- =====================================================================
-- 0002_rls_policies.sql
-- Row Level Security (RLS) policies for Dolania (Explore Curug Banyumas)
-- =====================================================================

-- =====================================================================
-- Helper function: is_admin()
-- Checks whether the currently authenticated user (auth.uid()) has
-- role = 'admin' in public.profiles. SECURITY DEFINER so it can read
-- public.profiles regardless of the caller's own RLS restrictions on
-- that table (avoids recursive policy issues).
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- =====================================================================
-- 1. curugs
-- =====================================================================
alter table public.curugs enable row level security;

drop policy if exists "curugs_select_published" on public.curugs;
create policy "curugs_select_published"
  on public.curugs
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "curugs_insert_admin" on public.curugs;
create policy "curugs_insert_admin"
  on public.curugs
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "curugs_update_admin" on public.curugs;
create policy "curugs_update_admin"
  on public.curugs
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "curugs_delete_admin" on public.curugs;
create policy "curugs_delete_admin"
  on public.curugs
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 2. articles
-- =====================================================================
alter table public.articles enable row level security;

drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published"
  on public.articles
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "articles_insert_admin" on public.articles;
create policy "articles_insert_admin"
  on public.articles
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "articles_update_admin" on public.articles;
create policy "articles_update_admin"
  on public.articles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles_delete_admin" on public.articles;
create policy "articles_delete_admin"
  on public.articles
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 3. trips
-- No is_published column: all trips (public or private) are readable.
-- Private trips are simply not surfaced in public listings and rely on
-- the link being shared manually — access control happens at the
-- application layer, not via RLS.
-- =====================================================================
alter table public.trips enable row level security;

drop policy if exists "trips_select_all" on public.trips;
create policy "trips_select_all"
  on public.trips
  for select
  to anon, authenticated
  using (true);

drop policy if exists "trips_insert_admin" on public.trips;
create policy "trips_insert_admin"
  on public.trips
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "trips_update_admin" on public.trips;
create policy "trips_update_admin"
  on public.trips
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trips_delete_admin" on public.trips;
create policy "trips_delete_admin"
  on public.trips
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 4. trip_curugs (pivot: trips <-> curugs)
-- No own publish flag — readable by everyone so the public trip detail
-- page can resolve which destinations belong to a trip.
-- =====================================================================
alter table public.trip_curugs enable row level security;

drop policy if exists "trip_curugs_select_all" on public.trip_curugs;
create policy "trip_curugs_select_all"
  on public.trip_curugs
  for select
  to anon, authenticated
  using (true);

drop policy if exists "trip_curugs_insert_admin" on public.trip_curugs;
create policy "trip_curugs_insert_admin"
  on public.trip_curugs
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "trip_curugs_update_admin" on public.trip_curugs;
create policy "trip_curugs_update_admin"
  on public.trip_curugs
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trip_curugs_delete_admin" on public.trip_curugs;
create policy "trip_curugs_delete_admin"
  on public.trip_curugs
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 5. features (master list of trip inclusions)
-- =====================================================================
alter table public.features enable row level security;

drop policy if exists "features_select_active" on public.features;
create policy "features_select_active"
  on public.features
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "features_insert_admin" on public.features;
create policy "features_insert_admin"
  on public.features
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "features_update_admin" on public.features;
create policy "features_update_admin"
  on public.features
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "features_delete_admin" on public.features;
create policy "features_delete_admin"
  on public.features
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 6. trip_features (pivot: trips <-> features)
-- No own is_active column — visibility follows the linked feature's
-- is_active flag via a subquery.
-- =====================================================================
alter table public.trip_features enable row level security;

drop policy if exists "trip_features_select_active" on public.trip_features;
create policy "trip_features_select_active"
  on public.trip_features
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.features f
      where f.id = trip_features.feature_id
        and f.is_active = true
    )
  );

drop policy if exists "trip_features_insert_admin" on public.trip_features;
create policy "trip_features_insert_admin"
  on public.trip_features
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "trip_features_update_admin" on public.trip_features;
create policy "trip_features_update_admin"
  on public.trip_features
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trip_features_delete_admin" on public.trip_features;
create policy "trip_features_delete_admin"
  on public.trip_features
  for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- 7. participants
-- =====================================================================
alter table public.participants enable row level security;

-- Anyone (guest via anon key, or a logged-in participant) may submit a
-- booking. The application layer is responsible for setting user_id
-- correctly based on the current session (or leaving it null for guests).
drop policy if exists "participants_insert_anyone" on public.participants;
create policy "participants_insert_anyone"
  on public.participants
  for insert
  to anon, authenticated
  with check (true);

-- Admin can see every booking.
drop policy if exists "participants_select_admin" on public.participants;
create policy "participants_select_admin"
  on public.participants
  for select
  to authenticated
  using (public.is_admin());

-- A logged-in participant can see only their own bookings.
drop policy if exists "participants_select_own" on public.participants;
create policy "participants_select_own"
  on public.participants
  for select
  to authenticated
  using (user_id = auth.uid());

-- Only admin can update a booking (e.g. approve/reject/waitlist).
drop policy if exists "participants_update_admin" on public.participants;
create policy "participants_update_admin"
  on public.participants
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 8. profiles
-- =====================================================================
alter table public.profiles enable row level security;

-- A user can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Admin can read every profile (e.g. to show Member/Guest info for bookings).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- A user can update only their own profile.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Note: profile rows are expected to be created automatically via a
-- handle_new_user() trigger on auth.users (SECURITY DEFINER, bypasses
-- RLS) rather than a direct client-side insert, so no INSERT policy is
-- defined here on purpose.
