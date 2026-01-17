-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'CLIENT', -- 'ADMIN' or 'CLIENT'
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'CLIENT')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROJECTS
create table public.projects (
  id text primary key, -- e.g., 'PRJ-2024-001'
  user_id uuid references public.profiles(id),
  title text not null,
  client_name text,
  service_type text,
  budget numeric,
  status text, -- 'Pending', 'In Progress', 'Completed', etc.
  deadline date,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
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

-- 7. CHAT & MESSAGING
create table public.chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  name text,
  created_at timestamp with time zone default now()
);

create table public.room_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (room_id, user_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 8. STORAGE BUCKET
insert into storage.buckets (id, name, public) 
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload project files"
on storage.objects for insert to authenticated with check (bucket_id = 'project-files');

create policy "Public access to project files"
on storage.objects for select to public using (bucket_id = 'project-files');

-- 9. RLS POLICIES

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- Projects
alter table public.projects enable row level security;

create policy "Admins view all projects" 
on public.projects for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Clients view own projects" 
on public.projects for select 
using (auth.uid() = user_id);

create policy "Clients can insert projects" 
on public.projects for insert 
with check (auth.uid() = user_id);

-- Project Phases
alter table public.project_phases enable row level security;

create policy "View phases if can view project" 
on public.project_phases for select 
using (
  exists (
    select 1 from public.projects 
    where projects.id = project_phases.project_id 
    and (projects.user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
  )
);

-- Project Files
alter table public.project_files enable row level security;

create policy "View files if can view project" 
on public.project_files for select 
using (true); -- Simplified for read access

create policy "Authenticated users can insert files" 
on public.project_files for insert 
with check (auth.role() = 'authenticated');

-- Invoices
alter table public.invoices enable row level security;

create policy "Admins view all invoices" 
on public.invoices for select 
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Clients view own invoices" 
on public.invoices for select 
using (client_name = (select full_name from public.profiles where id = auth.uid()));

-- Payment Methods
alter table public.payment_methods enable row level security;

create policy "Manage own payment methods" 
on public.payment_methods for all 
using (auth.uid() = user_id);

-- Chat System
alter table public.chat_rooms enable row level security;

create policy "View rooms I am in" 
on public.chat_rooms for select
using (exists (select 1 from public.room_members where room_id = id and user_id = auth.uid()));

alter table public.room_members enable row level security;

create policy "View members of my rooms" 
on public.room_members for select
using (
  room_id in (select room_id from public.room_members where user_id = auth.uid())
);

alter table public.messages enable row level security;

create policy "View messages in my rooms" 
on public.messages for select
using (
  room_id in (select room_id from public.room_members where user_id = auth.uid())
);

create policy "Send messages to my rooms" 
on public.messages for insert
with check (
  room_id in (select room_id from public.room_members where user_id = auth.uid())
);

-- Enable Realtime
alter publication supabase_realtime add table messages;
