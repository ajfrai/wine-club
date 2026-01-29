-- Add join_mode column to hosts table
ALTER TABLE public.hosts
ADD COLUMN join_mode VARCHAR(20) NOT NULL DEFAULT 'request'
  CHECK (join_mode IN ('public', 'request', 'private'));

-- Add request_message column to memberships table
ALTER TABLE public.memberships
ADD COLUMN request_message TEXT;

-- Update existing clubs to 'request' mode
UPDATE public.hosts
SET join_mode = 'request'
WHERE join_mode IS NULL;

-- Add index for join_mode lookups
CREATE INDEX hosts_join_mode_idx ON public.hosts(join_mode);
