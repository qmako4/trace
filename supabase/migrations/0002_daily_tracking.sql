-- Trace v0.2 — daily calorie + macro tracking
-- Adds nutrition fields to scan_history + a daily_targets table.
-- Run this in the Supabase SQL editor for your trace project.

-- ─── Extend scan_history with nutrition fields ──────────────────────
alter table scan_history add column if not exists kcal integer;
alter table scan_history add column if not exists protein_g real;
alter table scan_history add column if not exists carbs_g real;
alter table scan_history add column if not exists fat_g real;
alter table scan_history add column if not exists portions real default 1;
alter table scan_history add column if not exists meal text
  check (meal in ('breakfast', 'lunch', 'dinner', 'snack'));

-- ─── Daily targets per user ─────────────────────────────────────────
create table if not exists daily_targets (
  user_id uuid references auth.users(id) on delete cascade primary key,
  kcal integer default 2000,
  protein_g integer default 100,
  carbs_g integer default 250,
  fat_g integer default 65,
  max_upf_pct integer default 30,
  updated_at timestamptz default now()
);

alter table daily_targets enable row level security;

create policy "users read own targets"
  on daily_targets for select
  using (auth.uid() = user_id);

create policy "users insert own targets"
  on daily_targets for insert
  with check (auth.uid() = user_id);

create policy "users update own targets"
  on daily_targets for update
  using (auth.uid() = user_id);

create policy "users delete own targets"
  on daily_targets for delete
  using (auth.uid() = user_id);
