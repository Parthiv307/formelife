-- ==========================================================================
-- FORMA PLATFORM / HUNTER SYSTEM — PRODUCTION BACKEND DATABASE SCHEMA
-- Multi-Device User Authentication, Strict Data Isolation & Real-Time Sync
-- Compatible with PostgreSQL & Supabase SQL Editor (100% Idempotent)
-- ==========================================================================

-- 1. BASE TABLES DEFINITION (Created if not already present)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text default 'Hunter Athlete',
  age integer default 28,
  gender text default 'male',
  height_cm numeric default 180,
  weight_kg numeric default 78.5,
  goal text default 'muscle_gain',
  activity text default 'moderately_active',
  streak_days integer default 14,
  calories_target integer default 2000,
  protein_target integer default 120,
  carbs_target integer default 260,
  fats_target integer default 70,
  water_target_liters numeric default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.meals (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  slot text not null check (slot in ('B', 'L', 'D', 'S', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
  description text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer default 0,
  fats integer default 0,
  prep_plan_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.prep_plans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  day text not null check (day in ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  slot text not null check (slot in ('B', 'L', 'D', 'S')),
  food_description text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.water_logs (
  date date not null default current_date,
  user_id uuid references auth.users(id) on delete cascade,
  water_liters numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (date, user_id)
);

create table if not exists public.workout_sessions (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  date date not null default current_date,
  volume numeric not null default 0,
  sets_count integer not null default 0,
  duration_seconds integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.personal_records (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) on delete cascade,
  exercise text not null,
  weight numeric not null default 0,
  reps integer not null default 0,
  est_1rm numeric not null default 0,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. NON-DESTRUCTIVE MIGRATIONS (Ensure user_id and updated_at exist on existing tables)
alter table public.profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.meals add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.meals add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.prep_plans add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.prep_plans add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.water_logs add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.water_logs add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.workout_sessions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.workout_sessions add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.personal_records add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.personal_records add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- 3. HIGH-PERFORMANCE USER ISOLATION INDEXES
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_meals_user_id on public.meals(user_id, date);
create index if not exists idx_prep_plans_user_id on public.prep_plans(user_id, day);
create index if not exists idx_water_logs_user_id on public.water_logs(user_id, date);
create index if not exists idx_workout_sessions_user_id on public.workout_sessions(user_id, date);

-- 4. ROW LEVEL SECURITY (RLS) & STRICT MULTI-USER ISOLATION POLICIES
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.prep_plans enable row level security;
alter table public.water_logs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.personal_records enable row level security;

-- Drop previous policies to prevent duplicate policy errors
drop policy if exists "Allow authenticated user profiles" on public.profiles;
drop policy if exists "Allow authenticated user meals" on public.meals;
drop policy if exists "Allow authenticated user prep_plans" on public.prep_plans;
drop policy if exists "Allow authenticated user water_logs" on public.water_logs;
drop policy if exists "Allow authenticated user workout_sessions" on public.workout_sessions;
drop policy if exists "Allow authenticated user personal_records" on public.personal_records;

drop policy if exists "Allow all actions on profiles" on public.profiles;
drop policy if exists "Allow all actions on meals" on public.meals;
drop policy if exists "Allow all actions on prep_plans" on public.prep_plans;
drop policy if exists "Allow all actions on water_logs" on public.water_logs;
drop policy if exists "Allow all actions on workout_sessions" on public.workout_sessions;
drop policy if exists "Allow all actions on personal_records" on public.personal_records;

-- Strict user-scoped RLS policies:
-- Authenticated users have full access to rows where user_id = auth.uid()
-- Anonymous fallback allows access only to unassigned/demo rows (user_id is null)
create policy "Allow authenticated user profiles" on public.profiles
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Allow authenticated user meals" on public.meals
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Allow authenticated user prep_plans" on public.prep_plans
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Allow authenticated user water_logs" on public.water_logs
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Allow authenticated user workout_sessions" on public.workout_sessions
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Allow authenticated user personal_records" on public.personal_records
  for all using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
  with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

-- 5. AUTOMATIC PROFILE INITIALIZATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name, calories_target, protein_target, streak_days)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    2000,
    120,
    14
  )
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. REALTIME REPLICATION PUBLICATION
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'meals') then
    alter publication supabase_realtime add table public.meals;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'prep_plans') then
    alter publication supabase_realtime add table public.prep_plans;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'water_logs') then
    alter publication supabase_realtime add table public.water_logs;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'workout_sessions') then
    alter publication supabase_realtime add table public.workout_sessions;
  end if;
exception
  when others then null;
end $$;
