-- Add latitude and longitude columns to hosts table for geographic proximity queries
ALTER TABLE public.hosts
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Create index on location columns for efficient proximity searches
CREATE INDEX hosts_location_idx ON public.hosts(latitude, longitude);

-- Add comment for documentation
COMMENT ON COLUMN public.hosts.latitude IS 'Host club latitude coordinate for proximity-based searches';
COMMENT ON COLUMN public.hosts.longitude IS 'Host club longitude coordinate for proximity-based searches';
