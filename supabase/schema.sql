-- Notevo Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Notebooks table
create table if not exists notebooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Notebook',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Notes table (encrypted at rest)
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  notebook_id uuid references notebooks(id) on delete set null,
  title text not null default 'Untitled',
  encrypted_body text not null default '',   -- AES-GCM ciphertext (base64)
  iv text not null default '',               -- 12-byte IV (base64)
  salt text not null default '',             -- 16-byte PBKDF2 salt (base64)
  tags text[] default '{}',
  is_encrypted boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists notes_user_id_idx on notes (user_id);
create index if not exists notes_notebook_id_idx on notes (notebook_id);
create index if not exists notes_created_at_idx on notes (created_at desc);
create index if not exists notebooks_user_id_idx on notebooks (user_id);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_notes_updated_at
  before update on notes
  for each row execute function update_updated_at_column();

create trigger update_notebooks_updated_at
  before update on notebooks
  for each row execute function update_updated_at_column();

-- Row Level Security
alter table notebooks enable row level security;
alter table notes enable row level security;

-- Notebooks RLS
create policy "Users can view own notebooks"
  on notebooks for select using (auth.uid() = user_id);

create policy "Users can create own notebooks"
  on notebooks for insert with check (auth.uid() = user_id);

create policy "Users can update own notebooks"
  on notebooks for update using (auth.uid() = user_id);

create policy "Users can delete own notebooks"
  on notebooks for delete using (auth.uid() = user_id);

-- Notes RLS
create policy "Users can view own notes"
  on notes for select using (auth.uid() = user_id);

create policy "Users can create own notes"
  on notes for insert with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on notes for update using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on notes for delete using (auth.uid() = user_id);
