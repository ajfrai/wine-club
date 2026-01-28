/*
 * Cleanup Test Data Script
 *
 * This script safely removes test data from the wine-club database.
 * Test data is identified by:
 *   - Users with @example.com or test% email addresses
 *   - Hosts with TEST% host codes
 *
 * IMPORTANT: This script uses a transaction with ROLLBACK by default.
 *
 * How to use:
 * 1. Review the SELECT statements to verify what will be deleted
 * 2. Uncomment the DELETE statements if you're confident
 * 3. Comment out the final ROLLBACK line
 * 4. Run: psql -U postgres -d postgres -f scripts/cleanup-test-data.sql
 * 5. If the output looks correct, uncomment COMMIT and remove ROLLBACK
 * 6. Re-run to actually commit the changes
 *
 * Safety features:
 * - Transaction wraps all changes (can be rolled back)
 * - Defaults to ROLLBACK (must manually change to COMMIT)
 * - Respects foreign key constraints (deletes in correct order)
 * - Uses WHERE clauses to prevent accidental mass deletion
 */

-- Start transaction (all changes can be rolled back)
BEGIN;

-- ============================================================
-- PREVIEW: Show what will be deleted
-- ============================================================

SELECT '========== TEST DATA TO BE DELETED ==========' as info;

SELECT 'USERS with @example.com or test% emails:' as category;
SELECT
  id,
  email,
  role,
  created_at
FROM public.users
WHERE
  email LIKE '%@example.com'
  OR email LIKE 'test%'
ORDER BY created_at;

SELECT 'HOSTS with TEST% codes:' as category;
SELECT
  h.id,
  h.user_id,
  h.host_code,
  h.club_address,
  u.email,
  h.created_at
FROM public.hosts h
JOIN public.users u ON h.user_id = u.id
WHERE h.host_code LIKE 'TEST%'
ORDER BY h.created_at;

SELECT 'MEMBERS belonging to test users:' as category;
SELECT
  m.id,
  m.user_id,
  u.email,
  m.created_at
FROM public.members m
JOIN public.users u ON m.user_id = u.id
WHERE
  u.email LIKE '%@example.com'
  OR u.email LIKE 'test%'
ORDER BY m.created_at;

SELECT 'MEMBERSHIPS of test users:' as category;
SELECT
  mb.id,
  mb.member_id,
  mb.host_id,
  mb.status,
  u.email,
  mb.joined_at
FROM public.memberships mb
JOIN public.users u ON mb.member_id = u.id
WHERE
  u.email LIKE '%@example.com'
  OR u.email LIKE 'test%'
ORDER BY mb.joined_at;

-- ============================================================
-- DELETE IN SAFE ORDER (respecting foreign keys)
-- ============================================================
-- IMPORTANT: Uncomment the DELETE statements below to actually delete data
-- Make sure to also change ROLLBACK to COMMIT at the end

-- Step 1: Delete memberships of test users
-- DELETE FROM public.memberships
-- WHERE member_id IN (
--   SELECT id FROM public.users
--   WHERE email LIKE '%@example.com' OR email LIKE 'test%'
-- )
-- OR host_id IN (
--   SELECT user_id FROM public.hosts
--   WHERE host_code LIKE 'TEST%'
-- );

-- Step 2: Delete memberships that reference test hosts
-- (Already deleted in step 1, but listed separately for clarity)

-- Step 3: Delete hosts with TEST% codes
-- DELETE FROM public.hosts
-- WHERE host_code LIKE 'TEST%';

-- Step 4: Delete members belonging to test users
-- DELETE FROM public.members
-- WHERE user_id IN (
--   SELECT id FROM public.users
--   WHERE email LIKE '%@example.com' OR email LIKE 'test%'
-- );

-- Step 5: Delete users with @example.com or test% emails
-- (NOTE: This will cascade delete related users records due to ON DELETE CASCADE)
-- DELETE FROM public.users
-- WHERE
--   email LIKE '%@example.com'
--   OR email LIKE 'test%';

-- ============================================================
-- Transaction control
-- ============================================================
-- IMPORTANT: Change ROLLBACK to COMMIT when ready to actually delete
-- ROLLBACK;  -- Safe default: changes are NOT applied
-- COMMIT;    -- Uncomment only when ready to apply changes
ROLLBACK;
