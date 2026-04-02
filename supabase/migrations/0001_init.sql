-- Notevo — Initial Database Schema
-- Idempotent: safe to run multiple times
-- Run via: Supabase Dashboard → SQL Editor, or `supabase db push`

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────

create table if not exists public.notebooks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  title      text        not null default 'Untitled Notebook',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  notebook_id    uuid        references public.notebooks(id) on delete set null,
  title          text        not null default 'Untitled',
  encrypted_body text        not null default '',  -- AES-GCM ciphertext (base64)
  iv             text        not null default '',  -- 12-byte IV (base64)
  salt           text        not null default '',  -- 16-byte PBKDF2 salt (base64)
  tags           text[]      not null default '{}',
  is_encrypted   boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists notes_user_id_idx      on public.notes     (user_id);
create index if not exists notes_notebook_id_idx  on public.notes     (notebook_id);
create index if not exists notes_created_at_idx   on public.notes     (created_at desc);
create index if not exists notebooks_user_id_idx  on public.notebooks (user_id);

-- ── Auto-update updated_at ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at     on public.notes;
drop trigger if exists notebooks_set_updated_at on public.notebooks;

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create trigger notebooks_set_updated_at
  before update on public.notebooks
  for each row execute function public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────
alter table public.notebooks enable row level security;
alter table public.notes     enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "select_own_notebooks" on public.notebooks;
drop policy if exists "insert_own_notebooks" on public.notebooks;
drop policy if exists "update_own_notebooks" on public.notebooks;
drop policy if exists "delete_own_notebooks" on public.notebooks;

drop policy if exists "select_own_notes" on public.notes;
drop policy if exists "insert_own_notes" on public.notes;
drop policy if exists "update_own_notes" on public.notes;
drop policy if exists "delete_own_notes" on public.notes;

-- Notebooks RLS
create policy "select_own_notebooks" on public.notebooks
  for select using (auth.uid() = user_id);
create policy "insert_own_notebooks" on public.notebooks
  for insert with check (auth.uid() = user_id);
create policy "update_own_notebooks" on public.notebooks
  for update using (auth.uid() = user_id);
create policy "delete_own_notebooks" on public.notebooks
  for delete using (auth.uid() = user_id);

-- Notes RLS
create policy "select_own_notes" on public.notes
  for select using (auth.uid() = user_id);
create policy "insert_own_notes" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "update_own_notes" on public.notes
  for update using (auth.uid() = user_id);
create policy "delete_own_notes" on public.notes
  for delete using (auth.uid() = user_id);
