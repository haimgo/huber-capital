-- Huber Capital — Supabase schema, RLS, storage. Run once in Supabase SQL Editor.

-- ---------- content tables ----------
create table if not exists site_settings (
  id int primary key default 1,
  phone text, whatsapp text, location text,
  hero_eyebrow text, hero_title text, hero_sub text,
  manifesto_main text, manifesto_sub text,
  cta_title text, cta_sub text,
  constraint singleton check (id = 1)
);
create table if not exists stats          (id bigint generated always as identity primary key, value text, label text, sort int default 0);
create table if not exists process_steps  (id bigint generated always as identity primary key, n text, title text, "text" text, sort int default 0);
create table if not exists mistakes       (id bigint generated always as identity primary key, n text, title text, "text" text, sort int default 0);
create table if not exists areas          (id bigint generated always as identity primary key, name text, he text, blurb text, sort int default 0);
create table if not exists press          (id bigint generated always as identity primary key, outlet text, title text, url text, sort int default 0);
create table if not exists page_sections  (id bigint generated always as identity primary key, page text, slot text, value text, unique(page, slot));
create table if not exists news           (id bigint generated always as identity primary key, title text, slug text unique, date date, excerpt text, body text, cover_url text, published boolean default false, created_at timestamptz default now());
create table if not exists admins         (user_id uuid primary key references auth.users(id) on delete cascade, email text, created_at timestamptz default now());

-- ---------- admin check ----------
create or replace function is_admin() returns boolean language sql security definer stable as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------- RLS ----------
alter table site_settings enable row level security;
alter table stats          enable row level security;
alter table process_steps  enable row level security;
alter table mistakes       enable row level security;
alter table areas          enable row level security;
alter table press          enable row level security;
alter table page_sections  enable row level security;
alter table news           enable row level security;
alter table admins         enable row level security;

-- public read + admin write for all content tables
do $$ declare t text;
begin
  foreach t in array array['site_settings','stats','process_steps','mistakes','areas','press','page_sections','news'] loop
    execute format('drop policy if exists "public read" on %I;', t);
    execute format('create policy "public read" on %I for select using (true);', t);
    execute format('drop policy if exists "admin write" on %I;', t);
    execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- admins table: members can see the club; writes happen via the service-role API (bypasses RLS)
drop policy if exists "admins read" on admins;
create policy "admins read" on admins for select using (is_admin());

-- ---------- storage (images) ----------
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
create policy "media public read"  on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write"  on storage.objects for insert with check (bucket_id = 'media' and is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and is_admin());
