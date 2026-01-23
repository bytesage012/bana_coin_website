/**
 * SUPABASE DATABASE SCHEMA
 * 
 * Run the following SQL in your Supabase SQL Editor to set up the tables and security policies.
 */

export const SCHEMA_SQL = `
-- 1. Create Users Table (Public Profile)
create table public.users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Scores Table
create table public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  game_mode text not null, -- 'rush' or 'racer'
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Indexes for Leaderboard Performance
create index idx_scores_game_mode_score on public.scores(game_mode, score desc);
create index idx_users_username on public.users(username);

-- 4. Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.scores enable row level security;

-- 5. RLS Policies (Frictionless/Anonymous Access)
-- Allow anyone to read users and scores (for leaderboards)
create policy "Public Read Users" on public.users for select using (true);
create policy "Public Read Scores" on public.scores for select using (true);

-- Allow anyone to insert (for game saves)
create policy "Public Insert Users" on public.users for insert with check (true);
create policy "Public Insert Scores" on public.scores for insert with check (true);

-- 6. Enable Realtime
-- Go to Database -> Replication in Supabase Dashboard and enable for 'scores' table
alter publication supabase_realtime add table public.scores;
`;
