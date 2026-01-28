-- Create function to add hosts as members of their own clubs
-- This function bypasses RLS to allow bulk updates
CREATE OR REPLACE FUNCTION public.add_hosts_to_own_clubs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER;
BEGIN
  -- Insert membership records for hosts who aren't already members of their own club
  WITH inserted AS (
    INSERT INTO public.memberships (member_id, host_id, status)
    SELECT h.user_id, h.user_id, 'active'
    FROM public.hosts h
    WHERE NOT EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.member_id = h.user_id AND m.host_id = h.user_id
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;

  RETURN inserted_count;
END;
$$;

-- Grant execute permission to authenticated users (for admin use)
GRANT EXECUTE ON FUNCTION public.add_hosts_to_own_clubs() TO authenticated;

-- Run the function immediately to fix existing hosts
SELECT public.add_hosts_to_own_clubs();
