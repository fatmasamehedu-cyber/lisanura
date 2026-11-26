insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('live','live',false,10485760,array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/webp','image/jpeg','image/png'];
drop policy if exists "teacher manages own live images" on storage.objects;
create policy "teacher manages own live images" on storage.objects for all to authenticated
  using (bucket_id='live' and (storage.foldername(name))[1]=auth.uid()::text)
  with check (bucket_id='live' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "linked students read teacher live images" on storage.objects;
create policy "linked students read teacher live images" on storage.objects for select to authenticated
  using (bucket_id='live' and (storage.foldername(name))[1]=(select p.teacher_id::text from public.profiles p where p.id=auth.uid()));
