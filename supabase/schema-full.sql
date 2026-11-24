-- ليسانورا — إعداد قاعدة البيانات (تُنفَّذ مرة واحدة في SQL Editor)
-- Lisanura schema: profiles (teacher/student), saved boards, progress, live rooms, books bucket

-- 1) profiles: one row per user; role chosen at sign-up; students link to a teacher
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher','student')),
  display_name text not null default '',
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2) teacher's saved board (one row per teacher, whole board JSON)
create table if not exists public.board_states (
  teacher_id uuid primary key references public.profiles(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- 3) student game progress (one row per student per game)
create table if not exists public.progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  game text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, game)
);

-- 4) live rooms: teacher's current broadcast state (students read with the room code)
create table if not exists public.live_rooms (
  teacher_id uuid primary key references public.profiles(id) on delete cascade,
  live boolean not null default false,
  state jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.board_states enable row level security;
alter table public.progress enable row level security;
alter table public.live_rooms enable row level security;

-- profiles policies
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "signed-in users can find teachers by code" on public.profiles
  for select using (role = 'teacher');
create policy "teacher reads linked students" on public.profiles
  for select using (teacher_id = auth.uid());
create policy "student reads own teacher name" on public.profiles
  for select using (id = (select p.teacher_id from public.profiles p where p.id = auth.uid()));
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- board_states policies (teacher owns her board)
create policy "teacher manages own board" on public.board_states
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- progress policies (student owns rows; linked teacher can read)
create policy "student manages own progress" on public.progress
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "teacher reads linked students progress" on public.progress
  for select using (student_id in (select id from public.profiles where teacher_id = auth.uid()));

-- live_rooms policies (teacher writes; any signed-in user with the room id can read a live room)
create policy "teacher manages own room" on public.live_rooms
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "signed-in users read live rooms" on public.live_rooms
  for select using (live = true);

-- auto-create profile at sign-up from metadata (role, display_name, teacher_id)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name, teacher_id)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'role','student'),
    coalesce(new.raw_user_meta_data->>'display_name',''),
    nullif(new.raw_user_meta_data->>'teacher_id','')::uuid);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5) storage bucket for teacher books (PDFs/images), private, folder per teacher
insert into storage.buckets (id, name, public) values ('books','books', false)
on conflict (id) do nothing;

create policy "teacher manages own books folder" on storage.objects
  for all using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
-- Patch: avoid infinite recursion (profiles policy selecting from profiles).
-- A security-definer function bypasses RLS inside the lookup, so no recursion.

create or replace function public.my_student_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where teacher_id = auth.uid()
$$;

drop policy if exists "teacher reads linked students" on public.profiles;
create policy "teacher reads linked students" on public.profiles
  for select using (id in (select public.my_student_ids()));

drop policy if exists "teacher reads linked students progress" on public.progress;
create policy "teacher reads linked students progress" on public.progress
  for select using (student_id in (select public.my_student_ids()));
-- Patch 2: table privileges for signed-in users (RLS policies still protect the rows)
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.board_states to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
grant select, insert, update, delete on public.live_rooms to authenticated;
-- patch-books.sql — books storage bucket + teacher-folder policy (idempotent)
insert into storage.buckets (id, name, public) values ('books','books', false)
on conflict (id) do nothing;

drop policy if exists "teacher manages own books folder" on storage.objects;
create policy "teacher manages own books folder" on storage.objects
  for all using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
