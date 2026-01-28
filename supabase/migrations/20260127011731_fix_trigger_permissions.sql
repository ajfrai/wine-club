-- Fix: Add RLS policy to allow trigger function to insert users
-- The trigger runs as SECURITY DEFINER which bypasses RLS when properly configured
-- However, we need to ensure the function owner has proper permissions

-- First, grant necessary permissions to postgres role
GRANT INSERT ON public.users TO postgres;

-- Update the trigger function to ensure it works
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  insert_result INTEGER;
BEGIN
  -- Insert into users table
  -- This will use the "Allow trigger to insert user profiles" policy
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::user_role
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block auth user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
