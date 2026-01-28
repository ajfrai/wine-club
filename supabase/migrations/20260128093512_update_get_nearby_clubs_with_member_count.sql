-- Update get_nearby_clubs RPC to include member_count and wine_preferences
-- Filter to only show clubs with 7+ active members

-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS public.get_nearby_clubs(DECIMAL, DECIMAL, INTEGER);

CREATE OR REPLACE FUNCTION public.get_nearby_clubs(
  member_lat DECIMAL,
  member_lon DECIMAL,
  radius_miles INTEGER DEFAULT 50
)
RETURNS TABLE (
  host_id UUID,
  host_name TEXT,
  host_code VARCHAR(8),
  club_address TEXT,
  about_club TEXT,
  wine_preferences TEXT,
  member_count BIGINT,
  distance DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.user_id AS host_id,
    u.full_name AS host_name,
    h.host_code,
    h.club_address,
    h.about_club,
    h.wine_preferences,
    COUNT(m.id) FILTER (WHERE m.status = 'active') AS member_count,
    -- Haversine formula for distance in miles
    (
      3959 * acos(
        cos(radians(member_lat)) * cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(member_lon)) +
        sin(radians(member_lat)) * sin(radians(h.latitude))
      )
    )::DECIMAL AS distance
  FROM public.hosts h
  INNER JOIN public.users u ON h.user_id = u.id
  LEFT JOIN public.memberships m ON m.host_id = h.user_id
  WHERE h.latitude IS NOT NULL
    AND h.longitude IS NOT NULL
  GROUP BY h.user_id, u.full_name, h.host_code, h.club_address, h.about_club, h.wine_preferences, h.latitude, h.longitude
  HAVING COUNT(m.id) FILTER (WHERE m.status = 'active') >= 7
    AND (
      3959 * acos(
        cos(radians(member_lat)) * cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(member_lon)) +
        sin(radians(member_lat)) * sin(radians(h.latitude))
      )
    ) <= radius_miles
  ORDER BY distance;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_nearby_clubs(DECIMAL, DECIMAL, INTEGER) TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION public.get_nearby_clubs IS 'Returns nearby clubs with 7+ active members, including member count and wine preferences. Distance calculated using Haversine formula.';
