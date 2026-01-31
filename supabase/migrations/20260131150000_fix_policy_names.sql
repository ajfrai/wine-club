-- Fix: Drop the correctly-named old policies and keep our new multi-host policies
-- The previous migration used incorrect policy names, so the old policies are still active

-- 1. Drop the actual old event policies (correct names this time)
DROP POLICY IF EXISTS "Hosts can insert their own events" ON events;
DROP POLICY IF EXISTS "Hosts can update their own events" ON events;
DROP POLICY IF EXISTS "Hosts can delete their own events" ON events;

-- Note: "Club members can create events", "Club members can update events",
-- and "Club members can delete events" were already created and should remain

-- 2. Drop the actual old wines policies (correct names)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wines') THEN
    DROP POLICY IF EXISTS "Hosts can insert their own wines" ON wines;
    DROP POLICY IF EXISTS "Hosts can update their own wines" ON wines;
    DROP POLICY IF EXISTS "Hosts can delete their own wines" ON wines;

    -- Re-create the INSERT policy for wines (was missing from previous migration)
    CREATE POLICY "Club admins can insert wines"
    ON wines FOR INSERT
    TO authenticated
    WITH CHECK (
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
  END IF;
END $$;

-- 3. Drop the actual old event_payments policies (correct names)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_payments') THEN
    DROP POLICY IF EXISTS "Hosts can view payments for their events" ON event_payments;
    DROP POLICY IF EXISTS "Hosts can create payments for their events" ON event_payments;
    DROP POLICY IF EXISTS "Hosts can update payments for their events" ON event_payments;

    -- Re-create the VIEW policy for event_payments (was missing from previous migration)
    CREATE POLICY "Club admins can view event payments"
    ON event_payments FOR SELECT
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
      OR
      -- User can view their own payment
      user_id = auth.uid()
    );
  END IF;
END $$;

-- 4. Drop the old hosts policy (correct name)
DROP POLICY IF EXISTS "Users can update own host profile" ON hosts;
-- Note: "Club admins can update club profile" was already created and should remain
