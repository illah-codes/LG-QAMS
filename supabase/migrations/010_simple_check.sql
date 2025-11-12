-- ============================================
-- SIMPLE CHECK: Did you run migration 010?
-- ============================================
-- Run this first. If it says "NOT FOUND", you need to run migration 010.

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_insert_attendance_for_staff')
    THEN 'GOOD - Migration 010 was run'
    ELSE 'PROBLEM - Run migration 010_fix_attendance_rls.sql first'
  END as result;

-- ============================================
-- CHECK YOUR STAFF RECORD
-- ============================================
-- Replace 'your-email@example.com' with the email you use to login
-- This will show if your staff record is set up correctly

SELECT 
  id,
  name,
  email,
  auth_user_id,
  status,
  CASE 
    WHEN auth_user_id IS NULL THEN 'PROBLEM: Missing auth_user_id - Run migration 008'
    WHEN status != 'active' THEN 'PROBLEM: Status is not active'
    ELSE 'GOOD: Staff record looks OK'
  END as check_result
FROM staff
WHERE email = 'your-email@example.com';

-- ============================================
-- FIX: Link your staff record to auth user
-- ============================================
-- Only run this if the check above shows "Missing auth_user_id"
-- Replace 'your-email@example.com' with your email

/*
UPDATE staff
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
)
WHERE email = 'your-email@example.com'
  AND auth_user_id IS NULL;
*/

-- ============================================
-- FIX: Set status to active
-- ============================================
-- Only run this if the check above shows status is not active
-- Replace 'your-email@example.com' with your email

/*
UPDATE staff
SET status = 'active'
WHERE email = 'your-email@example.com';
*/

