-- Fix Reports RLS Policy - Use helper function to avoid RLS recursion issues
-- This migration creates a helper function and updates the reports INSERT policy

-- Helper function to check if current user can insert reports
-- Uses SECURITY DEFINER to bypass RLS when checking staff table
CREATE OR REPLACE FUNCTION can_insert_report()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
    AND staff.role = 'Admin'
    AND staff.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can create reports" ON reports;

-- Recreate policy using helper function
CREATE POLICY "Admins can create reports"
  ON reports FOR INSERT
  WITH CHECK (can_insert_report() = true);

