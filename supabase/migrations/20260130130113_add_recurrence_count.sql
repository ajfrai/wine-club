-- Add recurrence_count column to events table

ALTER TABLE public.events
  ADD COLUMN recurrence_count INTEGER;

COMMENT ON COLUMN public.events.recurrence_count IS 'Number of occurrences for recurring events';
