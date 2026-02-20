-- Enable UUID extension if not already enabled
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_weekly_hours integer not null default 20,
  completed_weeks_json jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  week_no integer not null check (week_no >= 0 and week_no <= 12),
  topic text not null,
  hours numeric(6,2) not null check (hours > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_logs_user_date on public.learning_logs (user_id, log_date desc);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.learning_logs enable row level security;

-- RLS policies: each user can access only their own rows
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

create policy "progress_select_own" on public.user_progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress
  for update using (auth.uid() = user_id);

create policy "logs_select_own" on public.learning_logs
  for select using (auth.uid() = user_id);
create policy "logs_insert_own" on public.learning_logs
  for insert with check (auth.uid() = user_id);
create policy "logs_update_own" on public.learning_logs
  for update using (auth.uid() = user_id);
create policy "logs_delete_own" on public.learning_logs
  for delete using (auth.uid() = user_id);
