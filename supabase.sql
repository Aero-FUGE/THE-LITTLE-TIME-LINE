-- 在 Supabase Dashboard 的 SQL Editor 中执行一次。
-- v2 unified document; legacy tables are retained for migration and rollback.
create table if not exists public.riji_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.riji_documents enable row level security;
drop policy if exists "Own journal document" on public.riji_documents;
create policy "Own journal document" on public.riji_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.time_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  start bigint not null,
  "end" bigint,
  note text not null default '',
  color text not null default '#92bba3',
  updated_at timestamptz not null default now()
);

alter table public.time_items add column if not exists estimate_min integer;
alter table public.time_items add column if not exists deadline bigint;
alter table public.time_items add column if not exists deadline_notified boolean not null default false;
alter table public.time_items add column if not exists side text not null default 'right';
alter table public.time_items add column if not exists collapsed boolean not null default false;

create table if not exists public.daily_tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  minutes integer not null default 30,
  repeat text not null default 'daily',
  weekday integer not null default 0,
  done_days jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.daily_tasks add column if not exists hour integer;
alter table public.daily_tasks add column if not exists minute integer;

create table if not exists public.daily_routines (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  hour integer not null default 22,
  minute integer not null default 0,
  minutes integer not null default 20,
  repeat text not null default 'daily',
  weekday integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.daily_routines enable row level security;

drop policy if exists "Users can read their own daily routines" on public.daily_routines;
drop policy if exists "Users can insert their own daily routines" on public.daily_routines;
drop policy if exists "Users can update their own daily routines" on public.daily_routines;
drop policy if exists "Users can delete their own daily routines" on public.daily_routines;

create policy "Users can read their own daily routines"
  on public.daily_routines for select using (auth.uid() = user_id);

create policy "Users can insert their own daily routines"
  on public.daily_routines for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily routines"
  on public.daily_routines for update using (auth.uid() = user_id);

create policy "Users can delete their own daily routines"
  on public.daily_routines for delete using (auth.uid() = user_id);

alter table public.daily_tasks enable row level security;

drop policy if exists "Users can read their own daily tasks" on public.daily_tasks;
drop policy if exists "Users can insert their own daily tasks" on public.daily_tasks;
drop policy if exists "Users can update their own daily tasks" on public.daily_tasks;
drop policy if exists "Users can delete their own daily tasks" on public.daily_tasks;

create policy "Users can read their own daily tasks"
  on public.daily_tasks for select using (auth.uid() = user_id);

create policy "Users can insert their own daily tasks"
  on public.daily_tasks for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily tasks"
  on public.daily_tasks for update using (auth.uid() = user_id);

create policy "Users can delete their own daily tasks"
  on public.daily_tasks for delete using (auth.uid() = user_id);

alter table public.time_items enable row level security;

drop policy if exists "Users can read their own time items" on public.time_items;
drop policy if exists "Users can insert their own time items" on public.time_items;
drop policy if exists "Users can update their own time items" on public.time_items;
drop policy if exists "Users can delete their own time items" on public.time_items;

create policy "Users can read their own time items"
  on public.time_items for select using (auth.uid() = user_id);

create policy "Users can insert their own time items"
  on public.time_items for insert with check (auth.uid() = user_id);

create policy "Users can update their own time items"
  on public.time_items for update using (auth.uid() = user_id);

create policy "Users can delete their own time items"
  on public.time_items for delete using (auth.uid() = user_id);
