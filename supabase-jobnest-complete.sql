-- JobNest backend-matched Supabase SQL
-- Run this in the Supabase SQL Editor for a fresh setup.
--
-- Important:
-- The previous SQL used Supabase Auth UUID users. This backend uses its own
-- integer users table with bcrypt password hashes and JWT auth, so this file
-- drops and recreates the app tables to match server/src/db/schema exactly.

create extension if not exists pgcrypto;

drop table if exists payments cascade;
drop table if exists subscriptions cascade;
drop table if exists saved_jobs cascade;
drop table if exists applications cascade;
drop table if exists jobs cascade;
drop table if exists settings cascade;
drop table if exists users cascade;

create table users (
  id serial primary key,
  name text not null,
  email text not null unique,
  phone text,
  password text not null,
  role text not null default 'user',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint users_role_check check (role in ('user', 'admin'))
);

create table jobs (
  id serial primary key,
  title text not null,
  company_name text not null,
  category text not null,
  location text not null,
  type text not null,
  salary text,
  apply_fee integer not null default 0,
  short_description text,
  full_description text,
  skills_required text,
  featured boolean not null default false,
  status text not null default 'active',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_apply_fee_check check (apply_fee >= 0),
  constraint jobs_status_check check (status in ('active', 'inactive', 'closed'))
);

create table applications (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  job_id integer not null references jobs(id) on delete cascade,
  utr_number text,
  payment_screenshot text,
  resume text,
  admin_note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint applications_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint applications_user_job_unique unique (user_id, job_id)
);

create table saved_jobs (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  job_id integer not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_jobs_user_job_unique unique (user_id, job_id)
);

create table subscriptions (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  utr_number text,
  payment_screenshot text,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint subscriptions_status_check check (status in ('pending', 'active', 'rejected', 'expired'))
);

create table payments (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  application_id integer references applications(id) on delete set null,
  amount integer not null,
  utr_number text not null,
  screenshot text,
  payment_status text not null default 'pending',
  verified_by integer references users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_status_check check (payment_status in ('pending', 'approved', 'rejected'))
);

create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_set_updated_at
before update on jobs
for each row
execute function set_updated_at();

create trigger settings_set_updated_at
before update on settings
for each row
execute function set_updated_at();

create index jobs_status_idx on jobs(status);
create index jobs_featured_idx on jobs(featured);
create index jobs_category_idx on jobs(category);
create index jobs_location_idx on jobs(location);
create index applications_user_id_idx on applications(user_id);
create index applications_job_id_idx on applications(job_id);
create index applications_status_idx on applications(status);
create index saved_jobs_user_id_idx on saved_jobs(user_id);
create index payments_user_id_idx on payments(user_id);
create index payments_status_idx on payments(payment_status);
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(status);

insert into settings (key, value)
values
  ('subscriptionAmount', '21'),
  ('subscriptionDays', '365'),
  ('upiId', 'rozgarplus@upi'),
  ('upiName', 'RozgarPlus')
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

insert into users (name, email, phone, password, role, is_blocked)
values
  ('Admin', 'admin@jobnest.com', '+91 9000000000', crypt('admin123', gen_salt('bf')), 'admin', false),
  ('Rahul Sharma', 'rahul@example.com', '+91 9876543210', crypt('user123', gen_salt('bf')), 'user', false)
on conflict (email) do nothing;

insert into jobs (
  title,
  company_name,
  category,
  location,
  type,
  salary,
  apply_fee,
  short_description,
  full_description,
  skills_required,
  featured,
  status,
  expires_at
)
values
  (
    'Frontend Developer',
    'TechCorp India',
    'Engineering',
    'Bangalore, Remote',
    'Full-time',
    'Rs 8,00,000 - Rs 14,00,000',
    99,
    'Build beautiful, responsive UIs with React and TypeScript.',
    'Develop and maintain React applications, collaborate with designers, optimize performance, and write clean TypeScript code.',
    'React, TypeScript, Tailwind CSS, REST APIs',
    true,
    'active',
    now() + interval '60 days'
  ),
  (
    'Backend Engineer',
    'Finova Solutions',
    'Engineering',
    'Mumbai',
    'Full-time',
    'Rs 10,00,000 - Rs 18,00,000',
    149,
    'Design and build scalable APIs and microservices.',
    'Design REST APIs, optimize database queries, build secure payment flows, and implement background jobs.',
    'Node.js, PostgreSQL, AWS, Docker, Redis',
    true,
    'active',
    now() + interval '45 days'
  ),
  (
    'Product Designer UI/UX',
    'DesignStudio Co.',
    'Design',
    'Remote',
    'Full-time',
    'Rs 6,00,000 - Rs 10,00,000',
    79,
    'Create intuitive user experiences for consumer and enterprise apps.',
    'Create wireframes, prototypes, high-fidelity designs, conduct user research, and maintain design systems.',
    'Figma, User Research, Prototyping, Design Systems',
    false,
    'active',
    now() + interval '30 days'
  ),
  (
    'Digital Marketing Manager',
    'GrowthLab',
    'Marketing',
    'Delhi, Hybrid',
    'Full-time',
    'Rs 5,00,000 - Rs 9,00,000',
    59,
    'Lead growth marketing across SEO, SEM, social, and email.',
    'Own performance campaigns, manage SEO strategy, analyze funnel metrics, and optimize conversions.',
    'Google Ads, SEO, Meta Ads, Analytics, Content Marketing',
    false,
    'active',
    now() + interval '20 days'
  ),
  (
    'Data Analyst',
    'InsightAI',
    'Engineering',
    'Hyderabad',
    'Full-time',
    'Rs 7,00,000 - Rs 12,00,000',
    99,
    'Transform raw data into actionable insights.',
    'Build dashboards, write SQL queries, support A/B tests, and present findings to stakeholders.',
    'SQL, Python, Tableau, Statistics, Excel',
    false,
    'active',
    now() + interval '40 days'
  )
on conflict do nothing;
