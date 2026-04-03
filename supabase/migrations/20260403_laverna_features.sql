-- ============================================================
-- Laverna features migration
-- tags + user_settings tables, enhanced notes, RLS, triggers
-- ============================================================

-- 1. tags table
create table if not exists public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_tags_user_id on public.tags(user_id);
create index if not exists idx_tags_name    on public.tags(name);

alter table public.tags enable row level security;
create policy "tags_select" on public.tags for select using (auth.uid() = user_id);
create policy "tags_insert" on public.tags for insert with check (auth.uid() = user_id);
create policy "tags_update" on public.tags for update using (auth.uid() = user_id);
create policy "tags_delete" on public.tags for delete using (auth.uid() = user_id);

-- 2. user_settings table
create table if not exists public.user_settings (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null unique references auth.users(id) on delete cascade,
  theme                      text not null default 'system' check (theme in ('light','dark','system')),
  editor_mode                text not null default 'normal' check (editor_mode in ('normal','preview','distraction_free')),
  enable_mathjax             boolean not null default false,
  enable_syntax_highlighting boolean not null default true,
  font_size                  integer not null default 14 check (font_size between 10 and 32),
  auto_save                  boolean not null default true,
  keybindings_preset         text not null default 'default' check (keybindings_preset in ('default','vim','emacs')),
  language                   text not null default 'en',
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists idx_user_settings_user_id on public.user_settings(user_id);

alter table public.user_settings enable row level security;
create policy "settings_select" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update" on public.user_settings for update using (auth.uid() = user_id);
create policy "settings_delete" on public.user_settings for delete using (auth.uid() = user_id);

-- 3. notes table enhancements (add pinned if missing, GIN index on tags)
alter table public.notes add column if not exists pinned boolean not null default false;
create index if not exists idx_notes_tags    on public.notes using gin(tags);
create index if not exists idx_notes_user_id on public.notes(user_id);

-- 4. auto-updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tags_updated_at
  before update on public.tags
  for each row execute procedure public.set_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_updated_at();

-- 5. auto-create default settings on new user signup
create or replace function public.handle_new_user_settings()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_settings on auth.users;
create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();
