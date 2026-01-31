-- Create event_payments table to track payment status for event attendees
create table if not exists public.event_payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'cancelled')),
  payment_method text check (payment_method in ('venmo', 'paypal', 'zelle', 'cash', 'other')),
  payment_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,

  -- Ensure one payment record per attendee per event
  unique(event_id, user_id)
);

-- Create index for faster lookups by event
create index idx_event_payments_event_id on public.event_payments(event_id);

-- Create index for faster lookups by user
create index idx_event_payments_user_id on public.event_payments(user_id);

-- Enable RLS
alter table public.event_payments enable row level security;

-- Policy: Hosts can view all payments for their events
create policy "Hosts can view payments for their events"
  on public.event_payments for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_payments.event_id
      and events.host_id = auth.uid()
    )
  );

-- Policy: Hosts can insert payments for their events
create policy "Hosts can create payments for their events"
  on public.event_payments for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = event_payments.event_id
      and events.host_id = auth.uid()
    )
  );

-- Policy: Hosts can update payments for their events
create policy "Hosts can update payments for their events"
  on public.event_payments for update
  using (
    exists (
      select 1 from public.events
      where events.id = event_payments.event_id
      and events.host_id = auth.uid()
    )
  );

-- Policy: Users can view their own payments
create policy "Users can view their own payments"
  on public.event_payments for select
  using (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
create or replace function public.update_event_payments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_event_payments_updated_at
  before update on public.event_payments
  for each row
  execute function public.update_event_payments_updated_at();
