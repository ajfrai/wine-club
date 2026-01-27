-- Create a function to insert user profile that bypasses RLS
-- This is needed because signUp() doesn't return a session when email confirmation is required
-- so auth.uid() is null and RLS blocks the INSERT

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
  -- Insert the user profile
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (user_id, user_email, user_role, user_full_name);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, user_role, TEXT) TO authenticated;

-- Also grant to anon role since signUp doesn't authenticate immediately with email confirmation
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, user_role, TEXT) TO anon;
