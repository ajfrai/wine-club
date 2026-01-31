-- Add transaction_type field to charges table to distinguish between charges and expenses
-- charge: money owed to the club (existing functionality)
-- expense: money owed to a member who paid on behalf of the club

alter table public.charges
  add column if not exists transaction_type text not null default 'charge'
  check (transaction_type in ('charge', 'expense'));

-- Create index for faster lookups by transaction type
create index if not exists idx_charges_transaction_type on public.charges(transaction_type);

-- Add comment to clarify the distinction
comment on column public.charges.transaction_type is
  'Type of transaction: charge (money owed to club) or expense (money club owes to member)';
