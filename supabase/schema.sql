-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Auth Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'CLIENT', -- 'ADMIN' or 'CLIENT'
  avatar_url text
);

-- 2. PROJECTS
create table public.projects (
  id text primary key, -- e.g., 'PRJ-2024-001'
  title text not null,
  client_name text,
  service_type text,
  budget numeric,
  status text, -- 'Pending', 'In Progress', 'Completed', etc.
  deadline date,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  user_id uuid references public.profiles(id)
);

-- 3. PROJECT PHASES
create table public.project_phases (
  id text primary key,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text, -- 'Pending', 'In Progress', 'Completed'
  created_at timestamp with time zone default now()
);

-- 4. PROJECT FILES
create table public.project_files (
  id text primary key,
  phase_id text references public.project_phases(id) on delete cascade,
  name text not null,
  url text not null,
  type text, -- 'pdf', 'img', 'doc', etc.
  uploaded_by text,
  date date default CURRENT_DATE
);

-- 5. INVOICES
create table public.invoices (
  id text primary key, -- e.g., 'INV-2024-001'
  project_id text references public.projects(id),
  client_name text,
  amount numeric,
  date date,
  status text -- 'Paid', 'Pending', 'Overdue'
);

-- 6. PAYMENT METHODS
create table public.payment_methods (
  id text primary key,
  user_id uuid references public.profiles(id),
  last4 text,
  brand text,
  expiry text,
  is_default boolean default false
);

-- 7. STORAGE BUCKET
-- Note: You must create a bucket named 'project-files' in the Supabase Storage UI
-- and set policies to allow authenticated uploads/downloads.
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true);

-- RLS POLICIES (Basic Example - Refine for production)
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

alter table public.projects enable row level security;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.payment_methods enable row level security;
create policy "Users can view own payment methods" on public.payment_methods for select using (auth.uid() = user_id);
create policy "Users can insert own payment methods" on public.payment_methods for insert with check (auth.uid() = user_id);
