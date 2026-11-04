-- Ruang Tanya — skema database
-- Jalankan sekali di Supabase: Dashboard > SQL Editor > New query > tempel semua isi file ini > Run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- sesi
create table if not exists public.sesi (
  id               uuid primary key default gen_random_uuid(),
  kode             text not null unique check (kode ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  topik            text not null,
  matkul           text not null default 'Pendidikan Agama Islam',
  kelompok_penyaji text not null,
  tanggal          date not null default current_date,
  materi           text,
  status           text not null default 'draf' check (status in ('draf', 'dibuka', 'ditutup')),
  sorotan_id       uuid,
  dibuat_pada      timestamptz not null default now()
);

-- ---------------------------------------------------------- pertanyaan
create table if not exists public.pertanyaan (
  id               uuid primary key default gen_random_uuid(),
  sesi_id          uuid not null references public.sesi(id) on delete cascade,
  nomor            int not null default 0,
  nama             text not null,
  nim              text not null,
  kelompok         text not null,
  avatar           int not null default 0 check (avatar between 0 and 11),
  tampil_sebagai   text not null default 'nama' check (tampil_sebagai in ('nama', 'avatar')),
  pertanyaan       text not null,
  jawaban_penanya  text,
  jawaban_ai       text,
  status_ai        text not null default 'menunggu' check (status_ai in ('menunggu', 'memproses', 'selesai', 'gagal')),
  ai_percobaan     int not null default 0,
  ai_model         text,
  ai_galat         text,
  jawaban_admin    text,
  pilihan_word     text check (pilihan_word in ('ai', 'penanya', 'admin')),
  jumlah_dukungan  int not null default 0,
  sudah_dijawab    boolean not null default false,
  disembunyikan    boolean not null default false,
  ditarik          boolean not null default false,
  diedit           boolean not null default false,
  perlu_dicek      boolean not null default false,
  perangkat        text not null,
  ip               text,
  dibuat_pada      timestamptz not null default now(),
  diubah_pada      timestamptz not null default now(),
  unique (sesi_id, nomor)
);
create index if not exists pertanyaan_sesi_idx on public.pertanyaan (sesi_id, nomor);

do $$ begin
  alter table public.sesi add constraint sesi_sorotan_fk
    foreign key (sorotan_id) references public.pertanyaan(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------ dukungan
create table if not exists public.dukungan (
  pertanyaan_id uuid not null references public.pertanyaan(id) on delete cascade,
  perangkat     text not null,
  dibuat_pada   timestamptz not null default now(),
  primary key (pertanyaan_id, perangkat)
);

-- ------------------------------------------------------------ triggers
-- Nomor urut per sesi (aman bila banyak orang mengirim bersamaan)
create or replace function public.rt_set_nomor() returns trigger
language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.sesi_id::text));
  select coalesce(max(nomor), 0) + 1 into new.nomor from public.pertanyaan where sesi_id = new.sesi_id;
  return new;
end $$;
drop trigger if exists rt_nomor on public.pertanyaan;
create trigger rt_nomor before insert on public.pertanyaan
  for each row execute function public.rt_set_nomor();

-- diubah_pada otomatis
create or replace function public.rt_touch() returns trigger
language plpgsql set search_path = public as $$
begin new.diubah_pada = now(); return new; end $$;
drop trigger if exists rt_touch on public.pertanyaan;
create trigger rt_touch before update on public.pertanyaan
  for each row execute function public.rt_touch();

-- jumlah_dukungan selalu sama dengan isi tabel dukungan
create or replace function public.rt_sync_dukungan() returns trigger
language plpgsql set search_path = public as $$
declare pid uuid := coalesce(new.pertanyaan_id, old.pertanyaan_id);
begin
  update public.pertanyaan
     set jumlah_dukungan = (select count(*) from public.dukungan where pertanyaan_id = pid)
   where id = pid;
  return null;
end $$;
drop trigger if exists rt_dukungan on public.dukungan;
create trigger rt_dukungan after insert or delete on public.dukungan
  for each row execute function public.rt_sync_dukungan();

-- --------------------------------------------------- Row Level Security
-- Semua akses lewat server (service role). Pengunjung anonim tidak bisa
-- membaca atau menulis tabel apa pun secara langsung.
alter table public.sesi       enable row level security;
alter table public.pertanyaan enable row level security;
alter table public.dukungan   enable row level security;

-- Proyek Supabase baru tidak otomatis memberi izin tabel. Hanya server (service_role) yang diberi akses;
-- anon dan authenticated sengaja tidak.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.sesi, public.pertanyaan, public.dukungan to service_role;
