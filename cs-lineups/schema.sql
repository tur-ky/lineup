-- Run this in your Supabase SQL Editor

-- 1. Create the Lineups table
create table public.lineups (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  map_name text not null,
  side text not null check (side in ('t', 'ct')),
  utility_type text not null check (utility_type in ('smoke', 'flash', 'molotov', 'he')),
  landing_x numeric not null,
  landing_y numeric not null,
  origin_x numeric null,
  origin_y numeric null,
  image_pos_path text null,
  image_aim_path text null,
  image_result_path text null,
  description text null,
  user_id uuid null default auth.uid (),
  constraint lineups_pkey primary key (id)
);

-- 2. Enable Realtime subscriptions
alter publication supabase_realtime add table public.lineups;

-- 3. Row Level Security Policies
alter table public.lineups enable row level security;

-- Allow everyone to read lineups
create policy "Enable read access for all users" 
on public.lineups for select 
using (true);

-- Allow only authenticated users to insert/create lineups
create policy "Enable insert for authenticated users only" 
on public.lineups for insert 
with check (auth.role() = 'authenticated');

-- Optional: Allow users to update their own lineups
create policy "Enable update for users based on user_id" 
on public.lineups for update 
using (auth.uid() = user_id);

-- 4. Storage Bucket Setup (Manual Step Reminder)
-- Go to Storage -> Create new bucket named 'lineup-images'
-- Make it Private (not Public)
