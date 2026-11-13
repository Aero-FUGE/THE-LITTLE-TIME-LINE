-- 在 Supabase Dashboard 的 SQL Editor 中执行一次。
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
