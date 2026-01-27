-- Make create_user_profile function idempotent
-- The trigger may have already created the profile, so we need to handle that gracefully

CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_role user_role,
  user_full_name TEXT
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to insert, but if it already exists (from trigger), update instead
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (user_id, user_email, user_role, user_full_name)
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
