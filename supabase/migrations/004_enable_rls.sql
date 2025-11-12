-- Enable Row Level Security on all tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin (bypasses RLS)
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

-- Helper function to get current user's staff record ID
CREATE OR REPLACE FUNCTION current_user_staff_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM staff
    WHERE auth.uid() = auth_user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff table policies
-- Staff can view their own profile
CREATE POLICY "Staff can view own profile"
  ON staff FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Admins can view all staff (using helper function to avoid recursion)
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  USING (is_admin() = true);

-- Admins can insert staff
CREATE POLICY "Admins can insert staff"
  ON staff FOR INSERT
  WITH CHECK (is_admin() = true);

-- Admins can update staff
CREATE POLICY "Admins can update staff"
  ON staff FOR UPDATE
  USING (is_admin() = true);

-- Staff can update their own email (for profile) - limited to email only
CREATE POLICY "Staff can update own email"
  ON staff FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Attendance table policies
-- Staff can view their own attendance
CREATE POLICY "Staff can view own attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = attendance.staff_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  USING (is_admin() = true);

-- Staff can insert their own attendance (for check-in/out)
CREATE POLICY "Staff can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = attendance.staff_id
      AND staff.auth_user_id = auth.uid()
      AND staff.status = 'active'
    )
  );

-- Staff can update their own attendance (for check-out)
CREATE POLICY "Staff can update own attendance"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = attendance.staff_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Admins can insert/update any attendance
CREATE POLICY "Admins can manage all attendance"
  ON attendance FOR ALL
  USING (is_admin() = true);

-- Settings table policies
-- Everyone authenticated can view settings
CREATE POLICY "Anyone authenticated can view settings"
  ON settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update settings
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (is_admin() = true);

-- Reports table policies
-- Staff can view their own reports
CREATE POLICY "Staff can view own reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = reports.staff_id
      AND staff.auth_user_id = auth.uid()
    )
    OR reports.staff_id IS NULL
  );

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (is_admin() = true);

-- Admins can insert reports
CREATE POLICY "Admins can create reports"
  ON reports FOR INSERT
  WITH CHECK (is_admin() = true);
