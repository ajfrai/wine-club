-- Fix: Bypass RLS in handle_new_user trigger function
-- The issue: RLS policy checks auth.uid() = id during INSERT, but auth.uid()
-- is not set yet during the trigger execution (AFTER INSERT on auth.users)
-- Solution: Set row_security=off for the duration of the function

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS for this function execution
  -- This is safe because SECURITY DEFINER ensures it runs with elevated privileges
  SET LOCAL row_security = off;

  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::user_role
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
