-- Add event status and recurring functionality

-- Create event status enum
CREATE TYPE event_status AS ENUM ('scheduled', 'cancelled', 'completed');

-- Add status column to events table
ALTER TABLE public.events
  ADD COLUMN status event_status DEFAULT 'scheduled' NOT NULL;

-- Add recurring flag
ALTER TABLE public.events
  ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering by status
CREATE INDEX events_status_idx ON public.events(status);

-- Add comment
COMMENT ON COLUMN public.events.status IS 'Event status: scheduled (default), cancelled (host cancelled), completed (event finished)';
COMMENT ON COLUMN public.events.is_recurring IS 'Flag indicating this event was created as part of a recurring series';
