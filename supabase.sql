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

alter table public.time_items enable row level security;

create policy "Users can read their own time items"
  on public.time_items for select using (auth.uid() = user_id);

create policy "Users can insert their own time items"
  on public.time_items for insert with check (auth.uid() = user_id);

create policy "Users can update their own time items"
  on public.time_items for update using (auth.uid() = user_id);

create policy "Users can delete their own time items"
  on public.time_items for delete using (auth.uid() = user_id);
