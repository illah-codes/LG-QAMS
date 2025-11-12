-- Fix RLS policies to allow email-based lookups during sign-in
-- This is needed when staff records exist but auth_user_id might not be linked yet

-- Drop existing staff SELECT policies
DROP POLICY IF EXISTS "Staff can view own profile" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;

-- Update is_admin function to also check by email for initial sign-in
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE (
      auth.uid() = auth_user_id
      OR (
        auth_user_id IS NULL
        AND EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = staff.email
        )
      )
    )
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff can view their own profile (by auth_user_id OR by email if not yet linked)
CREATE POLICY "Staff can view own profile"
  ON staff FOR SELECT
  USING (
    auth.uid() = auth_user_id
    OR (
      auth_user_id IS NULL
      AND EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email = staff.email
      )
    )
  );

-- Admins can view all staff (using helper function)
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  USING (is_admin() = true);

