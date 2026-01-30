-- Fix get_nearby_clubs function to properly return join_mode
--
-- Problem: There are two versions of this function, and the API calls the old one
-- which doesn't return join_mode, causing all clubs to be filtered out.
--
-- Solution: Drop the old function and fix the new one to handle type casting properly

-- Drop the OLD function that lacks join_mode
DROP FUNCTION IF EXISTS public.get_nearby_clubs(NUMERIC, NUMERIC, INTEGER);

-- Recreate the function with proper type casting
-- This ensures latitude/longitude from NUMERIC columns are cast to DOUBLE PRECISION
CREATE OR REPLACE FUNCTION public.get_nearby_clubs(
  member_lat DOUBLE PRECISION,
  member_lon DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION
)
RETURNS TABLE (
  host_id UUID,
  host_name TEXT,
  host_code VARCHAR(8),
  club_address TEXT,
  about_club TEXT,
  wine_preferences TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  join_mode VARCHAR(20),
  distance DOUBLE PRECISION,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.user_id AS host_id,
    u.full_name AS host_name,
    h.host_code,
    h.club_address,
    h.about_club,
    h.wine_preferences,
    h.latitude::DOUBLE PRECISION,  -- Explicit cast from NUMERIC
    h.longitude::DOUBLE PRECISION, -- Explicit cast from NUMERIC
    h.join_mode,
    (
      3959 * acos(
        cos(radians(member_lat)) *
        cos(radians(h.latitude::DOUBLE PRECISION)) *
        cos(radians(h.longitude::DOUBLE PRECISION) - radians(member_lon)) +
        sin(radians(member_lat)) *
        sin(radians(h.latitude::DOUBLE PRECISION))
      )
    ) AS distance,
    COALESCE(
      (SELECT COUNT(*)
       FROM public.memberships m
       WHERE m.host_id = h.user_id
         AND m.status = 'active'),
      0
    ) AS member_count
  FROM public.hosts h
  JOIN public.users u ON h.user_id = u.id
  WHERE h.latitude IS NOT NULL
    AND h.longitude IS NOT NULL
    AND (
      3959 * acos(
        cos(radians(member_lat)) *
        cos(radians(h.latitude::DOUBLE PRECISION)) *
        cos(radians(h.longitude::DOUBLE PRECISION) - radians(member_lon)) +
        sin(radians(member_lat)) *
        sin(radians(h.latitude::DOUBLE PRECISION))
      )
    ) <= radius_miles
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT ALL ON FUNCTION public.get_nearby_clubs(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon;
GRANT ALL ON FUNCTION public.get_nearby_clubs(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT ALL ON FUNCTION public.get_nearby_clubs(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO service_role;
