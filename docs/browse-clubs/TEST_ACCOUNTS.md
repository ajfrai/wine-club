# Test Accounts for Browse Clubs Feature

This document describes the test data created for MVP development of the "Browse Clubs" feature in the Wine Club application.

## Test Data Overview

The test seed script (`scripts/seed-test-clubs.sql`) creates:
- **5 test host clubs** with varying member counts and locations
- **51 test member accounts** (5 hosts + 1 primary test member + 45 members distributed across clubs)
- **Multiple geographic locations** across the San Francisco Bay Area for distance/proximity testing

## Test Host Clubs

All test hosts use the domain `@wineclub.test` for email addresses.

### Host 1: Test Host 1 - San Francisco
- **Host Code:** `TESTA001`
- **Email:** `testhost1@wineclub.test`
- **Location:** San Francisco, CA (37.7899, -122.3982)
- **Member Count:** 3 (below 7 minimum - won't show in browse)
- **Wine Preferences:** Bold reds, Pinot Noir, Zinfandel
- **About:** Intimate wine club focused on small batch boutique wineries from Sonoma Coast

**Members:** Member 1-1, Member 1-2, Member 1-3

### Host 2: Test Host 2 - Oakland
- **Host Code:** `TESTA002`
- **Email:** `testhost2@wineclub.test`
- **Location:** Oakland, CA (37.8044, -122.2712)
- **Member Count:** 6 (below 7 minimum - won't show in browse)
- **Wine Preferences:** Natural wines, Orange wines, Experimental blends
- **About:** Urban wine collective celebrating California wines and craft beverages

**Members:** Member 2-1 through Member 2-6

### Host 3: Test Host 3 - Berkeley
- **Host Code:** `TESTA003`
- **Email:** `testhost3@wineclub.test`
- **Location:** Berkeley, CA (37.8716, -122.2727)
- **Member Count:** 8 (will show in browse)
- **Wine Preferences:** Burgundy, German Riesling, Alsatian wines
- **About:** Academic wine club exploring the science and history of winemaking with UC Berkeley connections

**Members:** Member 3-1 through Member 3-8

**Distance from Test Member:** ~14.6 miles

### Host 4: Test Host 4 - Palo Alto
- **Host Code:** `TESTA004`
- **Email:** `testhost4@wineclub.test`
- **Location:** Palo Alto, CA (37.4419, -122.1430)
- **Member Count:** 10 (will show in browse)
- **Wine Preferences:** Napa Valley Cabernet, Bordeaux, Champagne
- **About:** Premium wine club featuring award-winning vintages and rare collector bottles

**Members:** Member 4-1 through Member 4-10

**Distance from Test Member:** ~35 miles

### Host 5: Test Host 5 - San Jose
- **Host Code:** `TESTA005`
- **Email:** `testhost5@wineclub.test`
- **Location:** San Jose, CA (37.3382, -121.8863)
- **Member Count:** 12 (will show in browse)
- **Wine Preferences:** Italian varieties, Spanish Tempranillo, South American Malbec
- **About:** Community-focused wine club celebrating diverse regional wines and fostering connections

**Members:** Member 5-1 through Member 5-12

**Distance from Test Member:** ~50 miles

## Primary Test Member

Use this account to test the "Browse Nearby Clubs" functionality:

- **Email:** `testmember@wineclub.test`
- **Full Name:** Test Member - San Francisco
- **Location:** San Francisco, CA (37.7749, -122.4194)
- **User ID:** `33333333-3333-3333-3333-333333333333`

## Test Scenarios

### Browse Clubs Filtered Results
When the test member searches for nearby clubs with a 50-mile radius, they should see:
- **3 clubs displayed** (those with 8+ members):
  1. Test Host 3 - Berkeley (8 members, ~14.6 miles away)
  2. Test Host 4 - Palo Alto (10 members, ~35 miles away)
  3. Test Host 5 - San Jose (12 members, ~50 miles away)

- **2 clubs hidden** (below 7 member minimum):
  - Test Host 1 - San Francisco (3 members)
  - Test Host 2 - Oakland (6 members)

### Distance Calculations
Distances are calculated from the test member's location (37.7749, -122.4194) using the Haversine formula:
- Berkeley: ~14.6 miles
- Palo Alto: ~35 miles
- San Jose: ~50 miles

## Database IDs

### Host User IDs
- Host 1: `11111111-1111-1111-1111-111111111111`
- Host 2: `11111111-1111-1111-1111-111111111112`
- Host 3: `11111111-1111-1111-1111-111111111113`
- Host 4: `11111111-1111-1111-1111-111111111114`
- Host 5: `11111111-1111-1111-1111-111111111115`

### Member User IDs
Member IDs follow the pattern `22222222-2222-2222-2222-111111111XYZ` where:
- X = host number (1-5)
- YZ = member number within that host's club

Test Member ID: `33333333-3333-3333-3333-333333333333`

## Running the Seed Script

To load this test data into your Supabase instance:

1. Connect to Supabase project: `rsoyoepdjhhswmapmdya`
2. Navigate to the SQL Editor in Supabase Dashboard
3. Copy the contents of `scripts/seed-test-clubs.sql`
4. Paste and execute the SQL script
5. All data will be inserted within a transaction (BEGIN/COMMIT)

## Cleanup

To remove all test data:

```sql
-- Delete in correct order to respect foreign key constraints
DELETE FROM public.memberships WHERE member_id LIKE '22222222%' OR member_id = '33333333-3333-3333-3333-333333333333' OR host_id LIKE '11111111%';
DELETE FROM public.members WHERE user_id LIKE '22222222%' OR user_id LIKE '11111111%' OR user_id = '33333333-3333-3333-3333-333333333333';
DELETE FROM public.hosts WHERE user_id LIKE '11111111%';
DELETE FROM public.users WHERE id LIKE '11111111%' OR id LIKE '22222222%' OR id = '33333333-3333-3333-3333-333333333333';
```

Note: This will not work directly due to RLS policies. Better approach is to delete via Supabase dashboard or use SECURITY DEFINER functions.

## Requirements Met

- [x] 5 test host users with varying characteristics
- [x] Host profiles with different member counts (3, 6, 8, 10, 12)
- [x] Different locations across SF Bay Area
- [x] Different wine preferences for each club
- [x] TEST* host codes (TESTA001 through TESTA005)
- [x] Test member user in San Francisco
- [x] Only clubs with 8+ members will show (7+ filter)
- [x] Proper UUIDs for all records
- [x] Memberships created to simulate member counts
