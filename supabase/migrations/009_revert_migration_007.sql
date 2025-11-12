-- Revert Migration 007: Remove auth.users queries that cause permission errors
-- Restore original simple RLS policies from migration 004
-- Since auth_user_id is populated, we don't need email fallback logic

-- Drop the problematic policies from migration 007
DROP POLICY IF EXISTS "Staff can view own profile" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;

-- Restore original is_admin() function (simple, no auth.users queries)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE auth.uid() = auth_user_id
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore original simple RLS policies
-- Staff can view their own profile (by auth_user_id match)
CREATE POLICY "Staff can view own profile"
  ON staff FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Admins can view all staff (using helper function)
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  USING (is_admin() = true);

