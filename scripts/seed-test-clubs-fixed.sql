-- Wine Club MVP Test Data Seed Script (Fixed for Supabase Auth)
-- This script creates test data using existing auth infrastructure
--
-- IMPORTANT: This script must be run AFTER creating auth users via the Admin API
-- OR you can run this in the Supabase Dashboard SQL Editor with service_role permissions

-- First, let's create auth users using raw_user_meta_data approach
-- These will automatically create entries in public.users via the trigger

BEGIN;

-- Create auth users for test hosts (these will cascade to public.users via trigger)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
  -- Test Host 1 (3 members - won't show)
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testhost1@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Host 1 - San Francisco", "role": "host"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  -- Test Host 2 (6 members - won't show)
  (
    '11111111-1111-1111-1111-111111111112'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testhost2@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Host 2 - Oakland", "role": "host"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  -- Test Host 3 (8 members - will show)
  (
    '11111111-1111-1111-1111-111111111113'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testhost3@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Host 3 - Berkeley", "role": "host"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  -- Test Host 4 (10 members - will show)
  (
    '11111111-1111-1111-1111-111111111114'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testhost4@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Host 4 - Palo Alto", "role": "host"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  -- Test Host 5 (12 members - will show)
  (
    '11111111-1111-1111-1111-111111111115'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testhost5@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Host 5 - San Jose", "role": "host"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  -- Primary Test Member
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'testmember@wineclub.test',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test Member - San Francisco", "role": "member"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Wait for triggers to create public.users entries, then update them
-- Insert/update public.users entries
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'testhost1@wineclub.test', 'host', 'Test Host 1 - San Francisco'),
  ('11111111-1111-1111-1111-111111111112'::uuid, 'testhost2@wineclub.test', 'host', 'Test Host 2 - Oakland'),
  ('11111111-1111-1111-1111-111111111113'::uuid, 'testhost3@wineclub.test', 'host', 'Test Host 3 - Berkeley'),
  ('11111111-1111-1111-1111-111111111114'::uuid, 'testhost4@wineclub.test', 'host', 'Test Host 4 - Palo Alto'),
  ('11111111-1111-1111-1111-111111111115'::uuid, 'testhost5@wineclub.test', 'host', 'Test Host 5 - San Jose'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'testmember@wineclub.test', 'member', 'Test Member - San Francisco')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- Create host profiles
INSERT INTO public.hosts (user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '123 Market Street, San Francisco, CA 94102', '123 Market Street, San Francisco, CA 94102', 'Intimate wine club focused on small batch boutique wineries from Sonoma Coast', 'Bold reds, Pinot Noir, Zinfandel', 'TESTA001', 37.7899, -122.3982),
  ('11111111-1111-1111-1111-111111111112'::uuid, '456 Broadway, Oakland, CA 94607', '456 Broadway, Oakland, CA 94607', 'Urban wine collective celebrating California wines and craft beverages', 'Natural wines, Orange wines, Experimental blends', 'TESTA002', 37.8044, -122.2712),
  ('11111111-1111-1111-1111-111111111113'::uuid, '789 University Avenue, Berkeley, CA 94710', '789 University Avenue, Berkeley, CA 94710', 'Academic wine club exploring the science and history of winemaking with UC Berkeley connections', 'Burgundy, German Riesling, Alsatian wines', 'TESTA003', 37.8716, -122.2727),
  ('11111111-1111-1111-1111-111111111114'::uuid, '123 University Avenue, Palo Alto, CA 94301', '123 University Avenue, Palo Alto, CA 94301', 'Premium wine club featuring award-winning vintages and rare collector bottles', 'Napa Valley Cabernet, Bordeaux, Champagne', 'TESTA004', 37.4419, -122.1430),
  ('11111111-1111-1111-1111-111111111115'::uuid, '456 South Market Street, San Jose, CA 95113', '456 South Market Street, San Jose, CA 95113', 'Community-focused wine club celebrating diverse regional wines and fostering connections', 'Italian varieties, Spanish Tempranillo, South American Malbec', 'TESTA005', 37.3382, -121.8863)
ON CONFLICT (user_id) DO NOTHING;

-- Create member profile for test member
INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES ('33333333-3333-3333-3333-333333333333'::uuid, '999 Market Street, San Francisco, CA 94103', 'San Francisco', 'CA', '94103', 37.7749, -122.4194)
ON CONFLICT (user_id) DO NOTHING;

-- Now create fake member accounts and memberships
-- We'll create them directly as UUIDs that reference the host users

-- For simplicity, let's create memberships using the host user IDs as "members" of other clubs
-- This is a workaround - in production, these would be real member accounts

-- Create memberships for Host 1 (3 active members from other hosts)
INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('11111111-1111-1111-1111-111111111112'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active'),
  ('11111111-1111-1111-1111-111111111113'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active')
ON CONFLICT DO NOTHING;

-- Create memberships for Host 2 (6 active members)
INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('11111111-1111-1111-1111-111111111113'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('11111111-1111-1111-1111-111111111114'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('11111111-1111-1111-1111-111111111115'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active')
ON CONFLICT DO NOTHING;

-- For hosts 3, 4, 5 we need MORE members to hit 7+ threshold
-- Let's create additional auth users for members

-- Create 30 additional test member auth users
DO $$
DECLARE
  i INTEGER;
  member_uuid UUID;
BEGIN
  FOR i IN 1..30 LOOP
    member_uuid := ('44444444-4444-4444-4444-' || LPAD(i::text, 12, '0'))::uuid;

    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES (
      member_uuid,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'testmember' || i || '@wineclub.test',
      crypt('testpassword123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Test Member ' || i || '", "role": "member"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, email, role, full_name)
    VALUES (member_uuid, 'testmember' || i || '@wineclub.test', 'member', 'Test Member ' || i)
    ON CONFLICT (id) DO UPDATE SET role = 'member';
  END LOOP;
END $$;

-- Create memberships for Host 3 (8 members - will show)
INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('44444444-4444-4444-4444-000000000001'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000002'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000003'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000004'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000005'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000006'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000007'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active')
ON CONFLICT DO NOTHING;

-- Create memberships for Host 4 (10 members - will show)
INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('44444444-4444-4444-4444-000000000008'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000009'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000010'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000011'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000012'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000013'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000014'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000015'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000016'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active')
ON CONFLICT DO NOTHING;

-- Create memberships for Host 5 (12 members - will show)
INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('44444444-4444-4444-4444-000000000017'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000018'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000019'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000020'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000021'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000022'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000023'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000024'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000025'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000026'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('44444444-4444-4444-4444-000000000027'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active')
ON CONFLICT DO NOTHING;

COMMIT;

-- Summary:
-- 5 Test Hosts with TEST* codes
-- 1 Primary test member (testmember@wineclub.test) in San Francisco
-- 30 additional test members
-- Host 3: 8 members (shows in browse)
-- Host 4: 10 members (shows in browse)
-- Host 5: 12 members (shows in browse)
-- All passwords: testpassword123
