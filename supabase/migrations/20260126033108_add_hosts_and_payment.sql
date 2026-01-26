-- Add payment tracking columns to users table
ALTER TABLE public.users
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN has_payment_method BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_setup_completed_at TIMESTAMPTZ;

-- Create hosts table for host-specific data
CREATE TABLE public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  club_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  about_club TEXT,
  wine_preferences TEXT,
  host_code VARCHAR(8) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on hosts table
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

-- Create policies for hosts table
-- Users can view their own host profile
CREATE POLICY "Users can view own host profile"
  ON public.hosts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own host profile
CREATE POLICY "Users can update own host profile"
  ON public.hosts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own host profile
CREATE POLICY "Users can insert own host profile"
  ON public.hosts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Members can view any host profile (for finding hosts)
CREATE POLICY "Members can view host profiles"
  ON public.hosts
  FOR SELECT
  USING (true);

-- Trigger to automatically update updated_at on hosts table
CREATE TRIGGER on_host_updated
  BEFORE UPDATE ON public.hosts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for host_code lookups
CREATE INDEX hosts_host_code_idx ON public.hosts(host_code);

-- Create index for user_id lookups
CREATE INDEX hosts_user_id_idx ON public.hosts(user_id);

-- Host code generator function
CREATE OR REPLACE FUNCTION public.generate_host_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar chars (O/0, I/1)
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.hosts WHERE host_code = result) INTO code_exists;

    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN result;
    END IF;
    -- Otherwise, loop will continue and generate a new code
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.hosts TO authenticated;
GRANT SELECT ON public.hosts TO anon;
