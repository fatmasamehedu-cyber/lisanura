-- Read-only export of the live LisaNura database, 2026-11-26. Tables (public):
-- table allowed_teacher_emails
create table public.allowed_teacher_emails (
  email text not null,
  created_at timestamp with time zone not null default now()
);

-- table board_states
create table public.board_states (
  teacher_id uuid not null,
  state jsonb not null,
  updated_at timestamp with time zone not null default now()
);

-- table live_rooms
create table public.live_rooms (
  teacher_id uuid not null,
  live boolean not null default false,
  state jsonb,
  updated_at timestamp with time zone not null default now()
);

-- table profiles
create table public.profiles (
  id uuid not null,
  role text not null,
  display_name text not null default ''::text,
  teacher_id uuid,
  created_at timestamp with time zone not null default now(),
  is_admin boolean not null default false
);

-- table progress
create table public.progress (
  student_id uuid not null,
  game text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now()
);

-- table shared_boards
create table public.shared_boards (
  id text not null,
  state jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- RLS policies
create policy "teacher manages own board" on public.board_states for ALL using ((teacher_id = auth.uid())) with check ((teacher_id = auth.uid()));
create policy "signed-in users read live rooms" on public.live_rooms for SELECT using ((live = true));
create policy "teacher manages own room" on public.live_rooms for ALL using ((teacher_id = auth.uid())) with check ((teacher_id = auth.uid()));
create policy "admin reads all profiles" on public.profiles for SELECT using (is_admin());
create policy "insert own profile" on public.profiles for INSERT using (true) with check ((auth.uid() = id));
create policy "read own profile" on public.profiles for SELECT using ((auth.uid() = id));
create policy "teacher reads linked students" on public.profiles for SELECT using ((id IN ( SELECT my_student_ids() AS my_student_ids)));
create policy "update own profile" on public.profiles for UPDATE using ((auth.uid() = id)) with check ((auth.uid() = id));
create policy "student manages own progress" on public.progress for ALL using ((student_id = auth.uid())) with check ((student_id = auth.uid()));
create policy "teacher reads linked students progress" on public.progress for SELECT using ((student_id IN ( SELECT my_student_ids() AS my_student_ids)));
create policy "anyone reads a shared board by link" on public.shared_boards for SELECT using (true);
create policy "signed-in users create shared boards" on public.shared_boards for INSERT using (true) with check ((auth.uid() IS NOT NULL));
create policy "teacher manages own books folder" on storage.objects for ALL using (((bucket_id = 'books'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))) with check (((bucket_id = 'books'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
-- Trigger
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Functions
CREATE OR REPLACE FUNCTION public.admin_who_joined()
 RETURNS TABLE(id uuid, display_name text, role text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
        select p.id, p.display_name, p.role, p.created_at, u.last_sign_in_at
          from public.profiles p
            join auth.users u on u.id = p.id
              where public.is_admin()
                order by p.created_at
                $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
      begin
        insert into public.profiles (id, role, display_name, teacher_id)
          values (new.id,
              case when exists (select 1 from public.allowed_teacher_emails e where e.email = new.email)
                       then 'teacher' else 'student' end,
                           coalesce(new.raw_user_meta_data->>'display_name',''),
                               null);
                                 return new;
                                 end $function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    select exists (select 1 from public.profiles where id = auth.uid() and is_admin)
    $function$
;

CREATE OR REPLACE FUNCTION public.link_to_teacher(code uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                       begin
                                         if not exists (select 1 from public.profiles where id = code and role = 'teacher') then
                                             return false;
                                               end if;
                                                 update public.profiles set teacher_id = code
                                                   where id = auth.uid() and role = 'student';
                                                     return found;
                                                     end $function$
;

CREATE OR REPLACE FUNCTION public.my_student_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id from public.profiles where teacher_id = auth.uid()
  $function$
;

CREATE OR REPLACE FUNCTION public.my_students_activity()
 RETURNS TABLE(id uuid, display_name text, created_at timestamp with time zone, last_active timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                  select p.id, p.display_name, p.created_at,
                           (select max(g.updated_at) from public.progress g where g.student_id = p.id)
                             from public.profiles p
                               where p.teacher_id = auth.uid()
                                 order by p.created_at
                                 $function$
;

CREATE OR REPLACE FUNCTION public.teacher_name_by_code(code uuid)
 RETURNS TABLE(id uuid, display_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                   select p.id, p.display_name
                                     from public.profiles p
                                       where p.id = code and p.role = 'teacher'
                                       $function$
;

