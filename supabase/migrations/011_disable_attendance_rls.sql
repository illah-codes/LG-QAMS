-- Disable Row Level Security on attendance table
-- This removes all RLS policy restrictions on attendance table
-- WARNING: This means any authenticated user can insert/update/select any attendance record
-- Use this for development/testing. For production, consider re-enabling RLS with proper policies.

-- Disable RLS on attendance table
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Optional: Drop existing policies (they won't be used anyway with RLS disabled)
-- Uncomment the lines below if you want to remove the policies
/*
DROP POLICY IF EXISTS "Staff can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can update own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;
*/

