-- Fix foreign key relationship for memberships.host_id
-- The host_id should reference hosts.user_id, not users.id directly
-- This allows proper joins to the hosts table for membership queries

-- First, clean up any orphaned memberships (where host no longer has a host profile)
-- This ensures the new foreign key constraint won't fail
DELETE FROM public.memberships
WHERE host_id NOT IN (SELECT user_id FROM public.hosts);

-- Drop the existing foreign key constraint
ALTER TABLE public.memberships
DROP CONSTRAINT IF EXISTS memberships_host_id_fkey;

-- Add new foreign key constraint to hosts table
ALTER TABLE public.memberships
ADD CONSTRAINT memberships_host_id_fkey
FOREIGN KEY (host_id)
REFERENCES public.hosts(user_id)
ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT memberships_host_id_fkey ON public.memberships
IS 'Links membership to host profile. Cascades delete when host profile is removed.';
