-- Create memberships table to manage member relationships with hosts
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, host_id)
);

-- Enable Row Level Security
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view their own memberships"
  ON public.memberships
  FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Hosts can view their members"
  ON public.memberships
  FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Authenticated users can insert memberships"
  ON public.memberships
  FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can update their own memberships"
  ON public.memberships
  FOR UPDATE
  USING (auth.uid() = member_id);

-- Create indexes for efficient lookups
CREATE INDEX memberships_member_id_idx ON public.memberships(member_id);
CREATE INDEX memberships_host_id_idx ON public.memberships(host_id);
CREATE INDEX memberships_status_idx ON public.memberships(status);

-- Grant permissions
GRANT ALL ON public.memberships TO authenticated;
GRANT SELECT ON public.memberships TO anon;
