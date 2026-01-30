-- Make club pages viewable without authentication

-- Allow anyone (including anonymous) to view user profiles (needed for host names on club pages)
CREATE POLICY "Public can view user profiles"
ON "public"."users"
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure hosts table is also publicly viewable
-- Drop existing "Members can view host profiles" policy if it's not set to PUBLIC
DROP POLICY IF EXISTS "Members can view host profiles" ON "public"."hosts";

-- Create new policy that explicitly allows public access
CREATE POLICY "Public can view host profiles"
ON "public"."hosts"
FOR SELECT
TO anon, authenticated
USING (true);
