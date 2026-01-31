-- Migration: Deprecate users.role column in favor of capability-based access
-- This is Phase 1 of the role deprecation plan.
--
-- Previously, user.role ('host' | 'member') was used for authorization.
-- Now, capabilities are determined by table presence:
--   - hosts table presence → can manage clubs
--   - members table presence → can join clubs
--   - memberships table → which clubs they're in
--
-- This migration:
-- 1. Makes the role column nullable (backward compatible)
-- 2. Updates the handle_new_user trigger to default to NULL
-- 3. Updates create_user_profile function to accept optional role

-- Step 1: Make the role column nullable
ALTER TABLE public.users ALTER COLUMN role DROP NOT NULL;

-- Step 2: Update the handle_new_user trigger to set role to NULL by default
-- (keeping the trigger for now to maintain backward compatibility with existing flows)
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

-- Step 3: Update create_user_profile function to accept optional role
-- Drop the old function signature and create a new one with optional role
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, user_role, TEXT);

CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_role user_role DEFAULT NULL,
  user_full_name TEXT DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the user profile with optional role
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (user_id, user_email, user_role, user_full_name);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, user_role, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, user_role, TEXT) TO anon;

-- Add a comment documenting the deprecation
COMMENT ON COLUMN public.users.role IS 'DEPRECATED: Use capability-based access instead. Check hosts/members tables for user capabilities.';
