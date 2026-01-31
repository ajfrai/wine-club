-- Fix: Restore SECURITY DEFINER and exception handler to handle_new_user trigger
-- The previous migration accidentally removed these, causing signup failures

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Role is now optional; if provided in metadata, use it, otherwise NULL
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block auth user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
