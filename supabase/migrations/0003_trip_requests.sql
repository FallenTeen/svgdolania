-- =====================================================================
-- 0003_trip_requests.sql
-- User-requested trip dates + admin approval -> trip + first participant
-- =====================================================================

create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  trip_date date not null,
  total_people integer not null default 1 check (total_people between 1 and 20),
  member_names jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_trip_id uuid references public.trips(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(member_names) = 'array'),
  check (jsonb_array_length(member_names) = total_people)
);

create table if not exists public.trip_request_curugs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.trip_requests(id) on delete cascade,
  curug_id uuid not null references public.curugs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, curug_id)
);

create index if not exists idx_trip_requests_status on public.trip_requests(status);
create index if not exists idx_trip_requests_trip_date on public.trip_requests(trip_date);
create index if not exists idx_trip_requests_user_id on public.trip_requests(user_id);
create index if not exists idx_trip_request_curugs_request_id on public.trip_request_curugs(request_id);

alter table public.trip_requests enable row level security;
alter table public.trip_request_curugs enable row level security;

drop policy if exists "trip_requests_insert_anyone" on public.trip_requests;
create policy "trip_requests_insert_anyone"
  on public.trip_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "trip_requests_select_admin" on public.trip_requests;
create policy "trip_requests_select_admin"
  on public.trip_requests
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "trip_requests_update_admin" on public.trip_requests;
create policy "trip_requests_update_admin"
  on public.trip_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trip_request_curugs_insert_anyone" on public.trip_request_curugs;
create policy "trip_request_curugs_insert_anyone"
  on public.trip_request_curugs
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "trip_request_curugs_select_admin" on public.trip_request_curugs;
create policy "trip_request_curugs_select_admin"
  on public.trip_request_curugs
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "trip_request_curugs_delete_admin" on public.trip_request_curugs;
create policy "trip_request_curugs_delete_admin"
  on public.trip_request_curugs
  for delete
  to authenticated
  using (public.is_admin());

drop trigger if exists set_updated_at on public.trip_requests;
create trigger set_updated_at
  before update on public.trip_requests
  for each row execute function public.update_updated_at_column();

-- Atomic approval: create the trip, destinations, approved first participant,
-- and mark the request approved in one database transaction.
create or replace function public.approve_trip_request(
  p_request_id uuid,
  p_title text,
  p_slug text,
  p_description text,
  p_itinerary text,
  p_trip_type text,
  p_trip_date date,
  p_meeting_point text,
  p_meeting_time time,
  p_price_per_person integer,
  p_max_participants integer,
  p_terms_and_conditions text,
  p_cover_image_url text,
  p_curug_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.trip_requests%rowtype;
  v_trip_id uuid;
  v_curug_id uuid;
begin
  select * into v_request
  from public.trip_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'REQUEST_ALREADY_PROCESSED';
  end if;

  if p_trip_type not in ('public', 'private') then
    raise exception 'INVALID_TRIP_TYPE';
  end if;

  if p_max_participants < v_request.total_people then
    raise exception 'MAX_PARTICIPANTS_TOO_SMALL';
  end if;

  if coalesce(array_length(p_curug_ids, 1), 0) < 1 then
    raise exception 'NO_CURUG_SELECTED';
  end if;

  insert into public.trips (
    title, slug, description, itinerary, trip_type, trip_date,
    meeting_point, meeting_time, price_per_person, max_participants,
    status, terms_and_conditions, cover_image_url
  ) values (
    p_title, p_slug, nullif(p_description, ''), nullif(p_itinerary, ''), p_trip_type, p_trip_date,
    nullif(p_meeting_point, ''), p_meeting_time, p_price_per_person, p_max_participants,
    'open', nullif(p_terms_and_conditions, ''), nullif(p_cover_image_url, '')
  ) returning id into v_trip_id;

  foreach v_curug_id in array p_curug_ids loop
    insert into public.trip_curugs (trip_id, curug_id)
    values (v_trip_id, v_curug_id)
    on conflict (trip_id, curug_id) do nothing;
  end loop;

  insert into public.participants (
    trip_id, user_id, contact_name, contact_phone, contact_email,
    total_people, member_names, is_guest, status,
    private_trip_access_confirmed, notes
  ) values (
    v_trip_id, v_request.user_id, v_request.contact_name, v_request.contact_phone, v_request.contact_email,
    v_request.total_people, v_request.member_names, v_request.user_id is null, 'approved',
    false, v_request.notes
  );

  update public.trip_requests
  set status = 'approved', approved_trip_id = v_trip_id, updated_at = now()
  where id = p_request_id;

  return v_trip_id;
end;
$$;

grant execute on function public.approve_trip_request(
  uuid, text, text, text, text, text, date, text, time,
  integer, integer, text, text, uuid[]
) to service_role;
