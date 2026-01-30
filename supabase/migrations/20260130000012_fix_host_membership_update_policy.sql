-- Fix: Allow hosts to update memberships in their clubs
--
-- Problem: Hosts cannot approve/deny membership requests because there's no
-- RLS policy allowing them to UPDATE memberships table.
--
-- The existing "Members can update their own memberships" policy only allows
-- members to update memberships where member_id = auth.uid(), but hosts need
-- to update memberships where host_id = auth.uid().

CREATE POLICY "Hosts can update memberships for their clubs"
ON public.memberships
FOR UPDATE
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);
