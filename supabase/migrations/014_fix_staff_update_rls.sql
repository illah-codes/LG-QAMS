-- Fix Staff UPDATE RLS Policy
-- The policy needs explicit WITH CHECK clause for UPDATE operations

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can update staff" ON staff;

-- Recreate policy with explicit WITH CHECK for UPDATE
CREATE POLICY "Admins can update staff"
  ON staff FOR UPDATE
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

