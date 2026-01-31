-- ... (previous tables)

-- 10. BOOKINGS
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_name text not null,
  booking_date date not null,
  booking_time text not null,
  service_type text default 'Consultation',
  status text default 'Confirmed' check (status in ('Confirmed', 'Pending', 'Cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Bookings
alter table public.bookings enable row level security;
create policy "Admin all bookings" on public.bookings for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Client own bookings" on public.bookings for all using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookings;