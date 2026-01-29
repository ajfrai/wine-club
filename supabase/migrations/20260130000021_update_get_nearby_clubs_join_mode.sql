-- Update get_nearby_clubs to include join_mode, latitude, and longitude
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
    h.latitude,
    h.longitude,
    h.join_mode,
    (
      3959 * acos(
        cos(radians(member_lat)) *
        cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(member_lon)) +
        sin(radians(member_lat)) *
        sin(radians(h.latitude))
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
        cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(member_lon)) +
        sin(radians(member_lat)) *
        sin(radians(h.latitude))
      )
    ) <= radius_miles
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE;
