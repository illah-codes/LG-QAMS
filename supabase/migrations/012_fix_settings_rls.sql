-- Fix Settings RLS Policy
-- The policy needs explicit WITH CHECK clause for INSERT operations

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

-- Recreate policy with explicit WITH CHECK for INSERT
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

