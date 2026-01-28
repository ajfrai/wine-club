-- Add phone and profile_picture_url to users table for personal information
ALTER TABLE public.users
ADD COLUMN phone TEXT,
ADD COLUMN profile_picture_url TEXT;

-- Create index on phone for potential future lookups
CREATE INDEX users_phone_idx ON public.users(phone) WHERE phone IS NOT NULL;
