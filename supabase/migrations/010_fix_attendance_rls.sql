-- Fix Attendance RLS Policy - Use helper function to avoid RLS recursion issues
-- This migration creates a helper function and updates the attendance INSERT policy

-- Helper function to check if current user can insert attendance for a staff record
-- Uses SECURITY DEFINER to bypass RLS when checking staff table
CREATE OR REPLACE FUNCTION can_insert_attendance_for_staff(staff_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE staff.id = staff_uuid
    AND staff.auth_user_id = auth.uid()
    AND staff.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policy
DROP POLICY IF EXISTS "Staff can insert own attendance" ON attendance;

-- Recreate policy using helper function
CREATE POLICY "Staff can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (can_insert_attendance_for_staff(attendance.staff_id));

