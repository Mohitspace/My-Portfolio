-- Run ONCE in the Supabase SQL Editor, after schema.sql.

-- 1. Admin flag. Users can edit their own name only, never is_admin.
alter table profiles add column if not exists is_admin boolean not null default false;
revoke update on profiles from authenticated, anon;
grant update (full_name) on profiles to authenticated;

create or replace function is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false)
$$;

create policy "admin reads profiles" on profiles for select using (is_admin());
create policy "admin reads downloads" on downloads for select using (is_admin());

-- 2. More resource fields + admin write access.
alter table resources add column if not exists author text;
alter table resources add column if not exists tags text[] not null default '{}';
alter table resources add column if not exists preview_allowed boolean not null default true;
create policy "admin inserts resources" on resources for insert with check (is_admin());
create policy "admin updates resources" on resources for update using (is_admin());
create policy "admin deletes resources" on resources for delete using (is_admin());

-- 3. Saved resources.
create table favorites (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  resource_id uuid not null references resources on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, resource_id)
);
alter table favorites enable row level security;
create policy "own favorites read" on favorites for select using (auth.uid() = user_id);
create policy "own favorites add" on favorites for insert with check (auth.uid() = user_id);
create policy "own favorites remove" on favorites for delete using (auth.uid() = user_id);

-- 4. Contact messages.
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  subject text check (char_length(subject) <= 200),
  body text not null check (char_length(body) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "anyone can send a message" on messages for insert to anon, authenticated with check (true);
create policy "admin reads messages" on messages for select using (is_admin());
create policy "admin updates messages" on messages for update using (is_admin());
create policy "admin deletes messages" on messages for delete using (is_admin());

-- 5. Editable site content (About Me, links).
create table site_settings (key text primary key, value jsonb not null default '{}');
alter table site_settings enable row level security;
create policy "anyone reads site settings" on site_settings for select using (true);
create policy "admin writes site settings" on site_settings for all using (is_admin()) with check (is_admin());
insert into site_settings (key, value) values ('site', jsonb_build_object(
  'about_title', 'About TheMohitFact',
  'about_body', 'TheMohitFact is a YouTube channel about self-improvement and personal development. This hub holds the extra material: PDFs, books, notes and guides that go deeper than a video can.' || E'\n\n' || 'Create a free account to download resources and save your favorites. If a topic helped you, or you want one covered, send a message below.',
  'youtube', '', 'instagram', '', 'twitter', '', 'email', '')) on conflict do nothing;

-- 6. Storage: public bucket for covers, admin-only writes to both buckets.
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
create policy "admin reads files" on storage.objects for select to authenticated using (bucket_id in ('resources','covers') and is_admin());
create policy "admin writes files" on storage.objects for insert to authenticated with check (bucket_id in ('resources','covers') and is_admin());
create policy "admin updates files" on storage.objects for update to authenticated using (bucket_id in ('resources','covers') and is_admin());
create policy "admin deletes files" on storage.objects for delete to authenticated using (bucket_id in ('resources','covers') and is_admin());

-- 7. Make yourself the admin (replace the email, run after you have signed up):
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
