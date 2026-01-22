-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text default 'CLIENT' check (role in ('ADMIN', 'CLIENT')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster lookups
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
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
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  client_name text not null,
  service_type text not null,
  budget numeric check (budget >= 0),
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'Cancelled', 'Paid', 'Declined')),
  deadline date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PROJECT PHASES
create table public.project_phases (
  id text primary key,
  project_id text references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed')),
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. PROJECT FILES
create table public.project_files (
  id uuid default uuid_generate_v4() primary key,
  project_id text references public.projects(id) on delete cascade not null,
  phase_id text references public.project_phases(id) on delete cascade,
  name text not null,
  url text not null,
  file_type text,
  file_size integer,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 5. INVOICES
create table public.invoices (
  id text primary key,
  project_id text references public.projects(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete set null,
  amount numeric check (amount >= 0) not null,
  currency text default 'USD',
  issue_date date default CURRENT_DATE,
  due_date date not null,
  status text default 'Pending' check (status in ('Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled')),
  payment_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PAYMENT METHODS
create table public.payment_methods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text,
  last4 text,
  brand text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 7. CHAT & MESSAGING
create table public.chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text,
  type text default 'group',
  project_id text references public.projects(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.room_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  message_type text default 'text',
  file_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 8. STORAGE BUCKETS
insert into storage.buckets (id, name, public) 
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload project files"
on storage.objects for insert to authenticated with check (bucket_id = 'project-files');

create policy "Authenticated users can select project files"
on storage.objects for select to authenticated using (bucket_id = 'project-files');

-- 9. RLS POLICIES (Simplified for brevity, ensure robust policies in prod)
alter table public.profiles enable row level security;
create policy "Public profiles" on public.profiles for select using (true);
create policy "User update own" on public.profiles for update using (auth.uid() = id);

alter table public.projects enable row level security;
create policy "Admin all projects" on public.projects for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Client own projects" on public.projects for all using (auth.uid() = user_id);

alter table public.invoices enable row level security;
create policy "Admin all invoices" on public.invoices for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Client own invoices" on public.invoices for select using (client_id = auth.uid());

-- Enable Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table invoices;
