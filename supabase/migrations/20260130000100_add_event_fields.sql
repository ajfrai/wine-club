-- Add wines_theme and price fields to events table
ALTER TABLE public.events
  ADD COLUMN wines_theme TEXT,
  ADD COLUMN price NUMERIC(10,2);

-- Add comment to clarify price can be null for free events
COMMENT ON COLUMN public.events.price IS 'Event price in dollars. NULL indicates free event.';
COMMENT ON COLUMN public.events.wines_theme IS 'Description of wines, theme, or surprise for the event';
