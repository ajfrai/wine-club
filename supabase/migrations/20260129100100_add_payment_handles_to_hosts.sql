-- Add payment handle columns to hosts table
-- These allow hosts to configure how members can pay them externally

ALTER TABLE public.hosts
ADD COLUMN venmo_username TEXT,
ADD COLUMN paypal_username TEXT,
ADD COLUMN zelle_handle TEXT,
ADD COLUMN accepts_cash BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.hosts.venmo_username IS 'Venmo username without @ symbol (e.g., johnsmith)';
COMMENT ON COLUMN public.hosts.paypal_username IS 'PayPal.me username (e.g., johnsmith for paypal.me/johnsmith)';
COMMENT ON COLUMN public.hosts.zelle_handle IS 'Zelle email or phone number';
COMMENT ON COLUMN public.hosts.accepts_cash IS 'Whether the host accepts cash payments at meetings';
