-- Create members table for storing member profile data including address for proximity search
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX members_user_id_idx ON public.members(user_id);
CREATE INDEX members_location_idx ON public.members(latitude, longitude);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Members can view and update their own profile
CREATE POLICY "Members can view their own profile"
  ON public.members
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can insert their own profile"
  ON public.members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their own profile"
  ON public.members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
