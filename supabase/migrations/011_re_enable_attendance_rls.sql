-- Re-enable Row Level Security on attendance table
-- Run this if you want to restore RLS policies on attendance table

-- Re-enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Recreate the policies using the helper function from migration 010
-- Make sure migration 010 has been run first (creates can_insert_attendance_for_staff function)

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
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE auth.uid() = auth_user_id
      AND role = 'Admin'
    )
  );

-- Staff can insert their own attendance (for check-in/out)
-- Uses helper function to avoid RLS recursion
CREATE POLICY "Staff can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (can_insert_attendance_for_staff(attendance.staff_id));

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

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE auth.uid() = auth_user_id
      AND role = 'Admin'
    )
  );

