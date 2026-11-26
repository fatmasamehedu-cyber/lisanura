-- PROPOSED, NOT APPLIED. Review first.
-- 1. Role protection (belt and braces; live grants already block it). Column UPDATE on profiles is display_name only.
create or replace function public.protect_profile_cols() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (new.role is distinct from old.role or new.is_admin is distinct from old.is_admin) then
    raise exception 'role and admin flags cannot be changed';
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_cols on public.profiles;
create trigger protect_profile_cols before update on public.profiles for each row execute function public.protect_profile_cols();

-- 2. live_rooms: only the teacher and her linked students can read a room.
drop policy if exists "signed-in users read live rooms" on public.live_rooms;
create policy "linked students read their teacher room" on public.live_rooms for select
  using (live = true and teacher_id = (select p.teacher_id from public.profiles p where p.id = auth.uid()));


create or replace function public.get_shared_board(board_id text) returns table(id text, state jsonb, created_at timestamptz)
  language sql stable security definer set search_path = public as $$
  select s.id, s.state, s.created_at from public.shared_boards s where s.id = board_id $$;
grant execute on function public.get_shared_board(text) to anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.my_student_ids() from anon;
create policy "live channel read" on realtime.messages for select to authenticated
  using (realtime.topic() = 'live:' || auth.uid()::text
      or realtime.topic() = 'live:' || (select p.teacher_id::text from public.profiles p where p.id = auth.uid()));
create policy "live channel send" on realtime.messages for insert to authenticated
  with check (realtime.topic() = 'live:' || auth.uid()::text
      or (extension = 'presence' and realtime.topic() = 'live:' || (select p.teacher_id::text from public.profiles p where p.id = auth.uid())));
