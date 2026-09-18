-- Trip requests now require an authenticated requester.
-- Existing rows are kept for compatibility, but new inserts are tied to auth.uid().

-- Remove anonymous insert access. The server action also checks the session,
-- so the rule is enforced both at the application and database layers.
drop policy if exists "trip_requests_insert_anyone" on public.trip_requests;
create policy "trip_requests_insert_authenticated_owner"
  on public.trip_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "trip_request_curugs_insert_anyone" on public.trip_request_curugs;
create policy "trip_request_curugs_insert_authenticated"
  on public.trip_request_curugs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.trip_requests tr
      where tr.id = request_id
        and tr.user_id = auth.uid()
    )
  );

-- Logged-in users can see only their own requests. Admins retain access to all requests.
drop policy if exists "trip_requests_select_admin" on public.trip_requests;
create policy "trip_requests_select_owner_or_admin"
  on public.trip_requests
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "trip_request_curugs_select_admin" on public.trip_request_curugs;
create policy "trip_request_curugs_select_owner_or_admin"
  on public.trip_request_curugs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.trip_requests tr
      where tr.id = request_id
        and (tr.user_id = auth.uid() or public.is_admin())
    )
  );
