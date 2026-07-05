-- Tempo Fitness Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  goals text[] default '{}',
  experience text default 'beginner' check (experience in ('beginner', 'intermediate', 'advanced')),
  equipment text[] default '{}',
  unit_pref text default 'kg' check (unit_pref in ('kg', 'lb')),
  created_at timestamptz default now()
);

-- ============================================
-- EXERCISES
-- ============================================
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null check (muscle_group in ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'traps', 'full_body')),
  secondary_muscles text[] default '{}',
  equipment text not null check (equipment in ('barbell', 'dumbbell', 'machine', 'cable', 'kettlebell', 'bodyweight', 'bands', 'plate', 'other')),
  instructions text default '',
  demo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index if not exists idx_exercises_muscle_group on public.exercises(muscle_group);
create index if not exists idx_exercises_equipment on public.exercises(equipment);
create index if not exists idx_exercises_name on public.exercises using gin (to_tsvector('english', name));

-- ============================================
-- WORKOUTS
-- ============================================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Workout',
  date date not null default current_date,
  duration integer,
  notes text,
  completed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_workouts_user_id on public.workouts(user_id);
create index if not exists idx_workouts_date on public.workouts(date desc);

-- ============================================
-- WORKOUT EXERCISES
-- ============================================
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  "order" integer not null default 0,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_workout_exercises_workout_id on public.workout_exercises(workout_id);

-- ============================================
-- WORKOUT SETS
-- ============================================
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number integer not null,
  reps integer not null default 0,
  weight numeric(10,2) not null default 0,
  rpe numeric(3,1),
  completed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_workout_sets_workout_exercise_id on public.workout_sets(workout_exercise_id);

-- ============================================
-- PROGRAMS
-- ============================================
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text default 'general' check (goal in ('strength', 'hypertrophy', 'endurance', 'general')),
  frequency integer default 3,
  duration_weeks integer default 8,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_programs_user_id on public.programs(user_id);

-- ============================================
-- PROGRAM DAYS
-- ============================================
create table if not exists public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  day_name text not null,
  "order" integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_program_days_program_id on public.program_days(program_id);

-- ============================================
-- PROGRAM EXERCISES
-- ============================================
create table if not exists public.program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets integer not null default 3,
  reps_scheme text not null default '8-12',
  rest_seconds integer default 90,
  created_at timestamptz default now()
);

create index if not exists idx_program_exercises_program_day_id on public.program_exercises(program_day_id);

-- ============================================
-- CHALLENGES
-- ============================================
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('streak', 'volume', 'frequency', 'custom')),
  start_date date not null,
  end_date date not null,
  goal integer not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================
-- CHALLENGE PARTICIPANTS
-- ============================================
create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress integer default 0,
  joined_at timestamptz default now(),
  unique(challenge_id, user_id)
);

-- ============================================
-- FRIENDSHIPS
-- ============================================
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- ============================================
-- BADGES
-- ============================================
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb default '{}'
);

-- ============================================
-- USER BADGES
-- ============================================
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: users can see all profiles, edit only their own
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Exercises: everyone can read, only creator can modify
alter table public.exercises enable row level security;
create policy "Exercises are viewable by everyone" on public.exercises for select using (true);
create policy "Users can create exercises" on public.exercises for insert with check (auth.uid() = created_by or created_by is null);
create policy "Users can update own exercises" on public.exercises for update using (auth.uid() = created_by);
create policy "Users can delete own exercises" on public.exercises for delete using (auth.uid() = created_by);

-- Workouts: only owner can access
alter table public.workouts enable row level security;
create policy "Users can view own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts" on public.workouts for delete using (auth.uid() = user_id);

-- Workout exercises: only owner via workout
alter table public.workout_exercises enable row level security;
create policy "Users can view own workout exercises" on public.workout_exercises for select using (
  exists (select 1 from public.workouts where id = workout_id and user_id = auth.uid())
);
create policy "Users can insert own workout exercises" on public.workout_exercises for insert with check (
  exists (select 1 from public.workouts where id = workout_id and user_id = auth.uid())
);
create policy "Users can update own workout exercises" on public.workout_exercises for update using (
  exists (select 1 from public.workouts where id = workout_id and user_id = auth.uid())
);
create policy "Users can delete own workout exercises" on public.workout_exercises for delete using (
  exists (select 1 from public.workouts where id = workout_id and user_id = auth.uid())
);

-- Workout sets: only owner via workout exercise
alter table public.workout_sets enable row level security;
create policy "Users can view own workout sets" on public.workout_sets for select using (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
);
create policy "Users can insert own workout sets" on public.workout_sets for insert with check (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
);
create policy "Users can update own workout sets" on public.workout_sets for update using (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
);
create policy "Users can delete own workout sets" on public.workout_sets for delete using (
  exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id and w.user_id = auth.uid()
  )
);

-- Programs: only owner
alter table public.programs enable row level security;
create policy "Users can view own programs" on public.programs for select using (auth.uid() = user_id);
create policy "Users can insert own programs" on public.programs for insert with check (auth.uid() = user_id);
create policy "Users can update own programs" on public.programs for update using (auth.uid() = user_id);
create policy "Users can delete own programs" on public.programs for delete using (auth.uid() = user_id);

-- Program days: only owner via program
alter table public.program_days enable row level security;
create policy "Users can view own program days" on public.program_days for select using (
  exists (select 1 from public.programs where id = program_id and user_id = auth.uid())
);
create policy "Users can insert own program days" on public.program_days for insert with check (
  exists (select 1 from public.programs where id = program_id and user_id = auth.uid())
);
create policy "Users can update own program days" on public.program_days for update using (
  exists (select 1 from public.programs where id = program_id and user_id = auth.uid())
);
create policy "Users can delete own program days" on public.program_days for delete using (
  exists (select 1 from public.programs where id = program_id and user_id = auth.uid())
);

-- Program exercises: only owner via program day
alter table public.program_exercises enable row level security;
create policy "Users can view own program exercises" on public.program_exercises for select using (
  exists (
    select 1 from public.program_days pd
    join public.programs p on p.id = pd.program_id
    where pd.id = program_day_id and p.user_id = auth.uid()
  )
);
create policy "Users can insert own program exercises" on public.program_exercises for insert with check (
  exists (
    select 1 from public.program_days pd
    join public.programs p on p.id = pd.program_id
    where pd.id = program_day_id and p.user_id = auth.uid()
  )
);
create policy "Users can update own program exercises" on public.program_exercises for update using (
  exists (
    select 1 from public.program_days pd
    join public.programs p on p.id = pd.program_id
    where pd.id = program_day_id and p.user_id = auth.uid()
  )
);
create policy "Users can delete own program exercises" on public.program_exercises for delete using (
  exists (
    select 1 from public.program_days pd
    join public.programs p on p.id = pd.program_id
    where pd.id = program_day_id and p.user_id = auth.uid()
  )
);

-- Challenges: everyone can view, only creator can modify
alter table public.challenges enable row level security;
create policy "Challenges are viewable by everyone" on public.challenges for select using (true);
create policy "Users can create challenges" on public.challenges for insert with check (auth.uid() = created_by);
create policy "Users can update own challenges" on public.challenges for update using (auth.uid() = created_by);
create policy "Users can delete own challenges" on public.challenges for delete using (auth.uid() = created_by);

-- Challenge participants: everyone can view, users manage their own
alter table public.challenge_participants enable row level security;
create policy "Participants are viewable by everyone" on public.challenge_participants for select using (true);
create policy "Users can join challenges" on public.challenge_participants for insert with check (auth.uid() = user_id);
create policy "Users can update own participation" on public.challenge_participants for update using (auth.uid() = user_id);
create policy "Users can leave challenges" on public.challenge_participants for delete using (auth.uid() = user_id);

-- Friendships: users can see their own + accepted friends
alter table public.friendships enable row level security;
create policy "Users can view own friendships" on public.friendships for select using (
  auth.uid() = user_id or auth.uid() = friend_id
);
create policy "Users can create friendships" on public.friendships for insert with check (auth.uid() = user_id);
create policy "Users can update own friendships" on public.friendships for update using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can delete own friendships" on public.friendships for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Badges: everyone can view
alter table public.badges enable row level security;
create policy "Badges are viewable by everyone" on public.badges for select using (true);

-- User badges: users can view their own
alter table public.user_badges enable row level security;
create policy "Users can view own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Users can earn badges" on public.user_badges for insert with check (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
