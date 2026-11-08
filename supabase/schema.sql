create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now()
);
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  format text,
  size_bytes bigint,
  file_path text not null,          -- path inside the private 'resources' bucket
  cover_url text,
  access text not null default 'members' check (access in ('public','members')),
  downloads_count int not null default 0,
  created_at timestamptz default now()
);
create table downloads (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  resource_id uuid references resources on delete cascade,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table resources enable row level security;
alter table downloads enable row level security;
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "anyone can browse resources" on resources for select using (true);
create policy "own downloads read" on downloads for select using (auth.uid() = user_id);

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function log_download(rid uuid) returns void language sql security definer set search_path = public as $$
  insert into downloads (user_id, resource_id) values (auth.uid(), rid);
  update resources set downloads_count = downloads_count + 1 where id = rid;
$$;

insert into storage.buckets (id, name, public) values ('resources', 'resources', false) on conflict do nothing;
