-- Add club_type support for fixed vs multi-host clubs
-- This migration adds the infrastructure for multi-host clubs where
-- hosting and location rotate between members

-- 1. Create club_type enum
CREATE TYPE club_type AS ENUM ('fixed', 'multi_host');

-- 2. Add club_type column to hosts table (default to 'fixed' for existing clubs)
ALTER TABLE hosts
ADD COLUMN club_type club_type NOT NULL DEFAULT 'fixed';

-- 3. Make address fields nullable for multi-host clubs
-- (multi-host clubs don't have a fixed address - it's set per event)
ALTER TABLE hosts
ALTER COLUMN club_address DROP NOT NULL,
ALTER COLUMN delivery_address DROP NOT NULL;

-- 4. Add event-specific host and location for multi-host clubs
-- event_host_id: The actual person hosting THIS event (for multi-host clubs)
-- event_location: The location for THIS event (for multi-host clubs)
-- For fixed clubs, these will be NULL and we use the host_id and hosts.club_address
ALTER TABLE events
ADD COLUMN event_host_id UUID REFERENCES users(id),
ADD COLUMN event_location TEXT;

-- 5. Add check constraint: for multi_host clubs, event_host_id and event_location are required
-- We can't enforce this at the DB level easily, so we'll handle it in the application layer

-- 6. Create index on event_host_id for efficient queries
CREATE INDEX idx_events_event_host_id ON events(event_host_id);

-- 7. Update RLS policies for multi-host clubs
-- Members of multi-host clubs should have same permissions as the club owner

-- Drop existing event policies that we need to update
DROP POLICY IF EXISTS "Hosts can create events" ON events;
DROP POLICY IF EXISTS "Hosts can update their events" ON events;
DROP POLICY IF EXISTS "Hosts can delete their events" ON events;

-- Recreate with multi-host support
-- For creating events: hosts can create, OR members of multi-host clubs can create
CREATE POLICY "Club members can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = events.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- For updating events: hosts can update, OR members of multi-host clubs can update
CREATE POLICY "Club members can update events"
ON events FOR UPDATE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = events.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- For deleting events: hosts can delete, OR members of multi-host clubs can delete
CREATE POLICY "Club members can delete events"
ON events FOR DELETE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = events.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- Update general_charges policies for multi-host clubs
DROP POLICY IF EXISTS "Hosts can create charges" ON general_charges;
DROP POLICY IF EXISTS "Hosts can update their charges" ON general_charges;
DROP POLICY IF EXISTS "Hosts can delete their charges" ON general_charges;

CREATE POLICY "Club admins can create charges"
ON general_charges FOR INSERT
TO authenticated
WITH CHECK (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = general_charges.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

CREATE POLICY "Club admins can update charges"
ON general_charges FOR UPDATE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = general_charges.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

CREATE POLICY "Club admins can delete charges"
ON general_charges FOR DELETE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = general_charges.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- Update event_payments policies for multi-host clubs
DROP POLICY IF EXISTS "Hosts can insert event payments" ON event_payments;
DROP POLICY IF EXISTS "Hosts can update event payments" ON event_payments;

CREATE POLICY "Club admins can insert event payments"
ON event_payments FOR INSERT
TO authenticated
WITH CHECK (
  -- User is the host of the event
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_payments.event_id
    AND e.host_id = auth.uid()
  )
  OR
  -- User is a member of a multi-host club that owns the event
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN hosts h ON h.user_id = e.host_id
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE e.id = event_payments.event_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

CREATE POLICY "Club admins can update event payments"
ON event_payments FOR UPDATE
TO authenticated
USING (
  -- User is the host of the event
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_payments.event_id
    AND e.host_id = auth.uid()
  )
  OR
  -- User is a member of a multi-host club that owns the event
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN hosts h ON h.user_id = e.host_id
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE e.id = event_payments.event_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- Update wines policies for multi-host clubs
DROP POLICY IF EXISTS "Hosts can update their wines" ON wines;
DROP POLICY IF EXISTS "Hosts can delete their wines" ON wines;

CREATE POLICY "Club admins can update wines"
ON wines FOR UPDATE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = wines.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

CREATE POLICY "Club admins can delete wines"
ON wines FOR DELETE
TO authenticated
USING (
  -- Original: user is the host
  host_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM hosts h
    INNER JOIN memberships m ON m.host_id = h.user_id
    WHERE h.user_id = wines.host_id
    AND h.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- Update hosts table policies for multi-host clubs
DROP POLICY IF EXISTS "Hosts can update their own profile" ON hosts;

CREATE POLICY "Club admins can update club profile"
ON hosts FOR UPDATE
TO authenticated
USING (
  -- Original: user is the host
  user_id = auth.uid()
  OR
  -- New: user is a member of a multi-host club
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.host_id = hosts.user_id
    AND hosts.club_type = 'multi_host'
    AND m.member_id = auth.uid()
    AND m.status = 'active'
  )
);

-- Add comment for future reference
COMMENT ON COLUMN hosts.club_type IS 'Type of club: fixed (traditional single host) or multi_host (rotating host/location)';
COMMENT ON COLUMN events.event_host_id IS 'For multi-host clubs: the member hosting this specific event. NULL for fixed clubs.';
COMMENT ON COLUMN events.event_location IS 'For multi-host clubs: the location for this specific event. NULL for fixed clubs.';
