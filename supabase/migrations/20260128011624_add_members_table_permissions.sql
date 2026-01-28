-- Add missing GRANT permissions to members table
-- This was missing from the original migration and prevented authenticated users from inserting member profiles

GRANT ALL ON public.members TO authenticated;
GRANT SELECT ON public.members TO anon;
