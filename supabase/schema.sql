-- NusaVerse: jalankan sekali di Supabase > SQL Editor (atau psql). Aman diulang: semua objek dibuat ulang.

-- Profil publik tiap akun. role hanya bisa diubah lewat fungsi set_role (khusus admin).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Cap paspor budaya yang tersinkron ke akun.
create table if not exists public.stamps (
  user_id uuid not null references public.profiles on delete cascade,
  province text not null check (province ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now(),
  primary key (user_id, province)
);

-- Cerita warga: kontribusi pengetahuan budaya, tampil setelah disetujui kurator (admin).
create table if not exists public.stories (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles on delete cascade,
  province text not null check (province ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists stories_province_status on public.stories (province, status);

alter table public.profiles enable row level security;
alter table public.stamps enable row level security;
alter table public.stories enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Profil dibuat otomatis saat daftar, nama diambil dari metadata pendaftaran.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Penjelajah'), 40));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- profiles: lihat milik sendiri (admin lihat semua), ubah hanya kolom display_name milik sendiri.
drop policy if exists "profil sendiri atau admin" on public.profiles;
create policy "profil sendiri atau admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
drop policy if exists "ubah profil sendiri" on public.profiles;
create policy "ubah profil sendiri" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- stamps: baca dan tambah milik sendiri; admin boleh baca semua untuk statistik.
drop policy if exists "cap sendiri" on public.stamps;
create policy "cap sendiri" on public.stamps for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "tambah cap sendiri" on public.stamps;
create policy "tambah cap sendiri" on public.stamps for insert to authenticated
  with check (user_id = (select auth.uid()));

-- stories: publik lihat yang disetujui; penulis lihat miliknya; admin lihat dan moderasi semua.
drop policy if exists "baca cerita" on public.stories;
create policy "baca cerita" on public.stories for select to anon, authenticated
  using (status = 'approved' or user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "kirim cerita" on public.stories;
create policy "kirim cerita" on public.stories for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending' and reviewed_at is null);
drop policy if exists "moderasi cerita" on public.stories;
create policy "moderasi cerita" on public.stories for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "hapus cerita" on public.stories;
create policy "hapus cerita" on public.stories for delete to authenticated
  using (public.is_admin());

-- Nama penulis cerita yang sudah disetujui (profiles tidak bisa dibaca publik).
create or replace function public.approved_stories(p_province text)
returns table (id bigint, title text, body text, author text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.id, s.title, s.body, p.display_name, s.created_at
  from public.stories s join public.profiles p on p.id = s.user_id
  where s.province = p_province and s.status = 'approved'
  order by s.created_at desc limit 50;
$$;

-- Papan peringkat: hanya nama tampilan dan jumlah cap yang dibuka ke publik.
create or replace function public.leaderboard(p_limit int default 20)
returns table (display_name text, stamps bigint, last_stamp timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.display_name, count(*), max(s.created_at)
  from public.stamps s join public.profiles p on p.id = s.user_id
  group by p.id, p.display_name
  order by count(*) desc, max(s.created_at) asc
  limit least(p_limit, 100);
$$;

-- Antrean moderasi lengkap dengan nama pengirim, khusus admin.
create or replace function public.pending_stories()
returns table (id bigint, province text, title text, body text, author text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'khusus admin'; end if;
  return query
    select s.id, s.province, s.title, s.body, p.display_name, s.created_at
    from public.stories s join public.profiles p on p.id = s.user_id
    where s.status = 'pending' order by s.created_at;
end;
$$;

-- Ubah peran pengguna, khusus admin, tidak bisa untuk diri sendiri (cegah admin terakhir hilang).
create or replace function public.set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'khusus admin'; end if;
  if p_user = (select auth.uid()) then raise exception 'tidak bisa mengubah peran sendiri'; end if;
  if p_role not in ('user', 'admin') then raise exception 'peran tidak dikenal'; end if;
  update public.profiles set role = p_role where id = p_user;
end;
$$;

revoke all on function public.pending_stories(), public.set_role(uuid, text) from public, anon;
grant execute on function public.pending_stories(), public.set_role(uuid, text) to authenticated;

-- Admin pertama (ganti email lalu jalankan setelah akun itu mendaftar):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'kamu@contoh.com');
