-- Create general charges table for membership dues and one-off charges
create table if not exists public.charges (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users(id) on delete cascade,
  member_id uuid references public.users(id) on delete cascade, -- null means applies to all members
  charge_type text not null check (charge_type in ('membership_dues', 'one_off', 'other')),
  title text not null,
  description text,
  amount numeric(10, 2) not null,
  due_date timestamp with time zone,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'cancelled')),
  payment_method text check (payment_method in ('venmo', 'paypal', 'zelle', 'cash', 'other')),
  payment_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create index for faster lookups by host
create index idx_charges_host_id on public.charges(host_id);

-- Create index for faster lookups by member
create index idx_charges_member_id on public.charges(member_id);

-- Create index for faster lookups by payment status
create index idx_charges_payment_status on public.charges(payment_status);

-- Enable RLS
alter table public.charges enable row level security;

-- Policy: Hosts can view all charges they created
create policy "Hosts can view their charges"
  on public.charges for select
  using (host_id = auth.uid());

-- Policy: Hosts can create charges
create policy "Hosts can create charges"
  on public.charges for insert
  with check (host_id = auth.uid());

-- Policy: Hosts can update their charges
create policy "Hosts can update their charges"
  on public.charges for update
  using (host_id = auth.uid());

-- Policy: Hosts can delete their charges
create policy "Hosts can delete their charges"
  on public.charges for delete
  using (host_id = auth.uid());

-- Policy: Members can view charges assigned to them or all members (member_id is null)
create policy "Members can view their charges"
  on public.charges for select
  using (
    member_id = auth.uid()
    or (
      member_id is null
      and exists (
        select 1 from public.memberships
        where memberships.member_id = auth.uid()
        and memberships.host_id = charges.host_id
        and memberships.status = 'active'
      )
    )
  );

-- Create trigger to update updated_at timestamp
create or replace function public.update_charges_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_charges_updated_at
  before update on public.charges
  for each row
  execute function public.update_charges_updated_at();
