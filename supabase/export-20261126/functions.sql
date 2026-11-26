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

