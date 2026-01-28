-- Wine Club MVP Test Data Seed Script
-- This script creates 5 test host clubs with varying characteristics for MVP development
-- Run this against the Supabase project: rsoyoepdjhhswmapmdya
--
-- Test clubs will have:
-- - TESTA001 to TESTA005: Host codes for testing
-- - Member counts: 3, 6, 8, 10, 12 (only 8, 10, 12 will show with 7+ filter)
-- - Different locations in Bay Area for distance testing
-- - Different wine preferences

BEGIN;

-- Create test host user 1 (3 members - won't show in browse)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'testhost1@wineclub.test',
  'host',
  'Test Host 1 - San Francisco'
);

INSERT INTO public.hosts (
  user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '123 Market Street, San Francisco, CA 94102',
  '123 Market Street, San Francisco, CA 94102',
  'Intimate wine club focused on small batch boutique wineries from Sonoma Coast',
  'Bold reds, Pinot Noir, Zinfandel',
  'TESTA001',
  37.7899,
  -122.3982
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '123 Market Street, San Francisco, CA 94102',
  'San Francisco',
  'CA',
  '94102',
  37.7899,
  -122.3982
);

-- Create member users for Host 1 (3 members)
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('22222222-2222-2222-2222-111111111111'::uuid, 'testmember1.1@wineclub.test', 'member', 'Member 1-1'),
  ('22222222-2222-2222-2222-111111111112'::uuid, 'testmember1.2@wineclub.test', 'member', 'Member 1-2'),
  ('22222222-2222-2222-2222-111111111113'::uuid, 'testmember1.3@wineclub.test', 'member', 'Member 1-3');

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES
  ('22222222-2222-2222-2222-111111111111'::uuid, '456 Valencia, San Francisco, CA', 'San Francisco', 'CA', '94110', 37.7599, -122.4229),
  ('22222222-2222-2222-2222-111111111112'::uuid, '789 Mission, San Francisco, CA', 'San Francisco', 'CA', '94105', 37.7749, -122.4194),
  ('22222222-2222-2222-2222-111111111113'::uuid, '321 Geary, San Francisco, CA', 'San Francisco', 'CA', '94102', 37.7849, -122.4129);

INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('22222222-2222-2222-2222-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111112'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111113'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'active');

-- Create test host user 2 (6 members - won't show in browse)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '11111111-1111-1111-1111-111111111112'::uuid,
  'testhost2@wineclub.test',
  'host',
  'Test Host 2 - Oakland'
);

INSERT INTO public.hosts (
  user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude
)
VALUES (
  '11111111-1111-1111-1111-111111111112'::uuid,
  '456 Broadway, Oakland, CA 94607',
  '456 Broadway, Oakland, CA 94607',
  'Urban wine collective celebrating California wines and craft beverages',
  'Natural wines, Orange wines, Experimental blends',
  'TESTA002',
  37.8044,
  -122.2712
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '11111111-1111-1111-1111-111111111112'::uuid,
  '456 Broadway, Oakland, CA 94607',
  'Oakland',
  'CA',
  '94607',
  37.8044,
  -122.2712
);

-- Create member users for Host 2 (6 members)
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('22222222-2222-2222-2222-111111111121'::uuid, 'testmember2.1@wineclub.test', 'member', 'Member 2-1'),
  ('22222222-2222-2222-2222-111111111122'::uuid, 'testmember2.2@wineclub.test', 'member', 'Member 2-2'),
  ('22222222-2222-2222-2222-111111111123'::uuid, 'testmember2.3@wineclub.test', 'member', 'Member 2-3'),
  ('22222222-2222-2222-2222-111111111124'::uuid, 'testmember2.4@wineclub.test', 'member', 'Member 2-4'),
  ('22222222-2222-2222-2222-111111111125'::uuid, 'testmember2.5@wineclub.test', 'member', 'Member 2-5'),
  ('22222222-2222-2222-2222-111111111126'::uuid, 'testmember2.6@wineclub.test', 'member', 'Member 2-6');

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES
  ('22222222-2222-2222-2222-111111111121'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94607', 37.8024, -122.2714),
  ('22222222-2222-2222-2222-111111111122'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94612', 37.8064, -122.2710),
  ('22222222-2222-2222-2222-111111111123'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94701', 37.8716, -122.2727),
  ('22222222-2222-2222-2222-111111111124'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94704', 37.8666, -122.2730),
  ('22222222-2222-2222-2222-111111111125'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94102', 37.7899, -122.3982),
  ('22222222-2222-2222-2222-111111111126'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94110', 37.7599, -122.4229);

INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('22222222-2222-2222-2222-111111111121'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111122'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111123'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111124'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111125'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111126'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 'active');

-- Create test host user 3 (8 members - will show in browse)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '11111111-1111-1111-1111-111111111113'::uuid,
  'testhost3@wineclub.test',
  'host',
  'Test Host 3 - Berkeley'
);

INSERT INTO public.hosts (
  user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude
)
VALUES (
  '11111111-1111-1111-1111-111111111113'::uuid,
  '789 University Avenue, Berkeley, CA 94710',
  '789 University Avenue, Berkeley, CA 94710',
  'Academic wine club exploring the science and history of winemaking with UC Berkeley connections',
  'Burgundy, German Riesling, Alsatian wines',
  'TESTA003',
  37.8716,
  -122.2727
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '11111111-1111-1111-1111-111111111113'::uuid,
  '789 University Avenue, Berkeley, CA 94710',
  'Berkeley',
  'CA',
  '94710',
  37.8716,
  -122.2727
);

-- Create member users for Host 3 (8 members)
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('22222222-2222-2222-2222-111111111131'::uuid, 'testmember3.1@wineclub.test', 'member', 'Member 3-1'),
  ('22222222-2222-2222-2222-111111111132'::uuid, 'testmember3.2@wineclub.test', 'member', 'Member 3-2'),
  ('22222222-2222-2222-2222-111111111133'::uuid, 'testmember3.3@wineclub.test', 'member', 'Member 3-3'),
  ('22222222-2222-2222-2222-111111111134'::uuid, 'testmember3.4@wineclub.test', 'member', 'Member 3-4'),
  ('22222222-2222-2222-2222-111111111135'::uuid, 'testmember3.5@wineclub.test', 'member', 'Member 3-5'),
  ('22222222-2222-2222-2222-111111111136'::uuid, 'testmember3.6@wineclub.test', 'member', 'Member 3-6'),
  ('22222222-2222-2222-2222-111111111137'::uuid, 'testmember3.7@wineclub.test', 'member', 'Member 3-7'),
  ('22222222-2222-2222-2222-111111111138'::uuid, 'testmember3.8@wineclub.test', 'member', 'Member 3-8');

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES
  ('22222222-2222-2222-2222-111111111131'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94701', 37.8716, -122.2727),
  ('22222222-2222-2222-2222-111111111132'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94704', 37.8666, -122.2730),
  ('22222222-2222-2222-2222-111111111133'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94607', 37.8044, -122.2712),
  ('22222222-2222-2222-2222-111111111134'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94612', 37.8064, -122.2710),
  ('22222222-2222-2222-2222-111111111135'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94102', 37.7899, -122.3982),
  ('22222222-2222-2222-2222-111111111136'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94110', 37.7599, -122.4229),
  ('22222222-2222-2222-2222-111111111137'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94115', 37.7749, -122.4194),
  ('22222222-2222-2222-2222-111111111138'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94105', 37.7749, -122.4194);

INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('22222222-2222-2222-2222-111111111131'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111132'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111133'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111134'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111135'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111136'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111137'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111138'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 'active');

-- Create test host user 4 (10 members - will show in browse)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '11111111-1111-1111-1111-111111111114'::uuid,
  'testhost4@wineclub.test',
  'host',
  'Test Host 4 - Palo Alto'
);

INSERT INTO public.hosts (
  user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude
)
VALUES (
  '11111111-1111-1111-1111-111111111114'::uuid,
  '123 University Avenue, Palo Alto, CA 94301',
  '123 University Avenue, Palo Alto, CA 94301',
  'Premium wine club featuring award-winning vintages and rare collector bottles',
  'Napa Valley Cabernet, Bordeaux, Champagne',
  'TESTA004',
  37.4419,
  -122.1430
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '11111111-1111-1111-1111-111111111114'::uuid,
  '123 University Avenue, Palo Alto, CA 94301',
  'Palo Alto',
  'CA',
  '94301',
  37.4419,
  -122.1430
);

-- Create member users for Host 4 (10 members)
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('22222222-2222-2222-2222-111111111141'::uuid, 'testmember4.1@wineclub.test', 'member', 'Member 4-1'),
  ('22222222-2222-2222-2222-111111111142'::uuid, 'testmember4.2@wineclub.test', 'member', 'Member 4-2'),
  ('22222222-2222-2222-2222-111111111143'::uuid, 'testmember4.3@wineclub.test', 'member', 'Member 4-3'),
  ('22222222-2222-2222-2222-111111111144'::uuid, 'testmember4.4@wineclub.test', 'member', 'Member 4-4'),
  ('22222222-2222-2222-2222-111111111145'::uuid, 'testmember4.5@wineclub.test', 'member', 'Member 4-5'),
  ('22222222-2222-2222-2222-111111111146'::uuid, 'testmember4.6@wineclub.test', 'member', 'Member 4-6'),
  ('22222222-2222-2222-2222-111111111147'::uuid, 'testmember4.7@wineclub.test', 'member', 'Member 4-7'),
  ('22222222-2222-2222-2222-111111111148'::uuid, 'testmember4.8@wineclub.test', 'member', 'Member 4-8'),
  ('22222222-2222-2222-2222-111111111149'::uuid, 'testmember4.9@wineclub.test', 'member', 'Member 4-9'),
  ('22222222-2222-2222-2222-111111111150'::uuid, 'testmember4.10@wineclub.test', 'member', 'Member 4-10');

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES
  ('22222222-2222-2222-2222-111111111141'::uuid, 'Palo Alto, CA', 'Palo Alto', 'CA', '94301', 37.4419, -122.1430),
  ('22222222-2222-2222-2222-111111111142'::uuid, 'Palo Alto, CA', 'Palo Alto', 'CA', '94303', 37.4449, -122.1460),
  ('22222222-2222-2222-2222-111111111143'::uuid, 'Mountain View, CA', 'Mountain View', 'CA', '94043', 37.3861, -122.0839),
  ('22222222-2222-2222-2222-111111111144'::uuid, 'Sunnyvale, CA', 'Sunnyvale', 'CA', '94085', 37.3688, -122.0363),
  ('22222222-2222-2222-2222-111111111145'::uuid, 'San Jose, CA', 'San Jose', 'CA', '95110', 37.3382, -121.8863),
  ('22222222-2222-2222-2222-111111111146'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94102', 37.7899, -122.3982),
  ('22222222-2222-2222-2222-111111111147'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94110', 37.7599, -122.4229),
  ('22222222-2222-2222-2222-111111111148'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94115', 37.7749, -122.4194),
  ('22222222-2222-2222-2222-111111111149'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94701', 37.8716, -122.2727),
  ('22222222-2222-2222-2222-111111111150'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94607', 37.8044, -122.2712);

INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('22222222-2222-2222-2222-111111111141'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111142'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111143'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111144'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111145'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111146'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111147'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111148'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111149'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111150'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 'active');

-- Create test host user 5 (12 members - will show in browse)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '11111111-1111-1111-1111-111111111115'::uuid,
  'testhost5@wineclub.test',
  'host',
  'Test Host 5 - San Jose'
);

INSERT INTO public.hosts (
  user_id, club_address, delivery_address, about_club, wine_preferences, host_code, latitude, longitude
)
VALUES (
  '11111111-1111-1111-1111-111111111115'::uuid,
  '456 South Market Street, San Jose, CA 95113',
  '456 South Market Street, San Jose, CA 95113',
  'Community-focused wine club celebrating diverse regional wines and fostering connections',
  'Italian varieties, Spanish Tempranillo, South American Malbec',
  'TESTA005',
  37.3382,
  -121.8863
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '11111111-1111-1111-1111-111111111115'::uuid,
  '456 South Market Street, San Jose, CA 95113',
  'San Jose',
  'CA',
  '95113',
  37.3382,
  -121.8863
);

-- Create member users for Host 5 (12 members)
INSERT INTO public.users (id, email, role, full_name)
VALUES
  ('22222222-2222-2222-2222-111111111151'::uuid, 'testmember5.1@wineclub.test', 'member', 'Member 5-1'),
  ('22222222-2222-2222-2222-111111111152'::uuid, 'testmember5.2@wineclub.test', 'member', 'Member 5-2'),
  ('22222222-2222-2222-2222-111111111153'::uuid, 'testmember5.3@wineclub.test', 'member', 'Member 5-3'),
  ('22222222-2222-2222-2222-111111111154'::uuid, 'testmember5.4@wineclub.test', 'member', 'Member 5-4'),
  ('22222222-2222-2222-2222-111111111155'::uuid, 'testmember5.5@wineclub.test', 'member', 'Member 5-5'),
  ('22222222-2222-2222-2222-111111111156'::uuid, 'testmember5.6@wineclub.test', 'member', 'Member 5-6'),
  ('22222222-2222-2222-2222-111111111157'::uuid, 'testmember5.7@wineclub.test', 'member', 'Member 5-7'),
  ('22222222-2222-2222-2222-111111111158'::uuid, 'testmember5.8@wineclub.test', 'member', 'Member 5-8'),
  ('22222222-2222-2222-2222-111111111159'::uuid, 'testmember5.9@wineclub.test', 'member', 'Member 5-9'),
  ('22222222-2222-2222-2222-111111111160'::uuid, 'testmember5.10@wineclub.test', 'member', 'Member 5-10'),
  ('22222222-2222-2222-2222-111111111161'::uuid, 'testmember5.11@wineclub.test', 'member', 'Member 5-11'),
  ('22222222-2222-2222-2222-111111111162'::uuid, 'testmember5.12@wineclub.test', 'member', 'Member 5-12');

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES
  ('22222222-2222-2222-2222-111111111151'::uuid, 'San Jose, CA', 'San Jose', 'CA', '95110', 37.3382, -121.8863),
  ('22222222-2222-2222-2222-111111111152'::uuid, 'San Jose, CA', 'San Jose', 'CA', '95112', 37.3343, -121.8931),
  ('22222222-2222-2222-2222-111111111153'::uuid, 'San Jose, CA', 'San Jose', 'CA', '95113', 37.3308, -121.8887),
  ('22222222-2222-2222-2222-111111111154'::uuid, 'Campbell, CA', 'Campbell', 'CA', '95008', 37.2871, -121.9488),
  ('22222222-2222-2222-2222-111111111155'::uuid, 'Sunnyvale, CA', 'Sunnyvale', 'CA', '94085', 37.3688, -122.0363),
  ('22222222-2222-2222-2222-111111111156'::uuid, 'Mountain View, CA', 'Mountain View', 'CA', '94043', 37.3861, -122.0839),
  ('22222222-2222-2222-2222-111111111157'::uuid, 'Palo Alto, CA', 'Palo Alto', 'CA', '94301', 37.4419, -122.1430),
  ('22222222-2222-2222-2222-111111111158'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94102', 37.7899, -122.3982),
  ('22222222-2222-2222-2222-111111111159'::uuid, 'San Francisco, CA', 'San Francisco', 'CA', '94110', 37.7599, -122.4229),
  ('22222222-2222-2222-2222-111111111160'::uuid, 'Berkeley, CA', 'Berkeley', 'CA', '94701', 37.8716, -122.2727),
  ('22222222-2222-2222-2222-111111111161'::uuid, 'Oakland, CA', 'Oakland', 'CA', '94607', 37.8044, -122.2712),
  ('22222222-2222-2222-2222-111111111162'::uuid, 'Fremont, CA', 'Fremont', 'CA', '94536', 37.5485, -121.9886);

INSERT INTO public.memberships (member_id, host_id, status)
VALUES
  ('22222222-2222-2222-2222-111111111151'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111152'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111153'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111154'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111155'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111156'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111157'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111158'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111159'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111160'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111161'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active'),
  ('22222222-2222-2222-2222-111111111162'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 'active');

-- Create primary test member user (in San Francisco for testing nearby clubs)
INSERT INTO public.users (id, email, role, full_name)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'testmember@wineclub.test',
  'member',
  'Test Member - San Francisco'
);

INSERT INTO public.members (user_id, address, city, state, zip_code, latitude, longitude)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '999 Market Street, San Francisco, CA 94103',
  'San Francisco',
  'CA',
  '94103',
  37.7749,
  -122.4194
);

COMMIT;

-- Summary of test data:
-- 5 Host Clubs (with TEST* host codes):
--   TESTA001: 3 members (won't show - below 7 min)
--   TESTA002: 6 members (won't show - below 7 min)
--   TESTA003: 8 members (will show)
--   TESTA004: 10 members (will show)
--   TESTA005: 12 members (will show)
--
-- 1 Primary Test Member:
--   testmember@wineclub.test (SF location 37.7749, -122.4194)
--   Can use to test "find nearby clubs" functionality
--
-- Additional test members are associated with each host club
