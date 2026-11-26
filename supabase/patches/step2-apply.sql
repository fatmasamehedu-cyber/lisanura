drop policy if exists "anyone reads a shared board by link" on public.shared_boards;
revoke select on public.shared_boards from anon;
