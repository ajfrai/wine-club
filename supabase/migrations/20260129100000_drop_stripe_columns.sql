-- Remove Stripe payment columns from users table
-- These are no longer needed since we're using external payment handles instead

ALTER TABLE public.users
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS has_payment_method,
DROP COLUMN IF EXISTS payment_setup_completed_at;
