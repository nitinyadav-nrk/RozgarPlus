-- Resume Building feature table
-- Run this in Supabase SQL Editor before using the Resume Builder screens.

create table if not exists public.resume_building_data (
  id serial primary key,
  user_id integer not null references public.users(id) on delete cascade,
  name text not null,
  gender text not null,
  phone text,
  email text,
  location text,
  education text,
  industry_type text not null,
  skills text,
  career_summary text,
  experiences jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resume_building_data_user_id_idx
  on public.resume_building_data(user_id);

create index if not exists resume_building_data_created_at_idx
  on public.resume_building_data(created_at desc);
