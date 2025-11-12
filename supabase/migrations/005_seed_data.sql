-- Seed initial admin user
-- Note: This requires creating a user in Supabase Auth first
-- Then update the auth_user_id below to match the auth user's UUID

-- Example admin staff record
-- Replace 'YOUR_AUTH_USER_UUID_HERE' with the actual UUID from Supabase Auth
-- Replace 'LGADM001' with your preferred admin staff ID format
INSERT INTO staff (staff_id, auth_user_id, name, email, department, role, status)
VALUES ('LGADM001', 'YOUR_AUTH_USER_UUID_HERE', 'Admin User', 'admin@lg.gov', 'IT', 'Admin', 'active')
ON CONFLICT (staff_id) DO NOTHING;

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('office_start_time', '"08:00"'),
  ('office_end_time', '"17:00"'),
  ('late_threshold_minutes', '15'),
  ('ip_restriction', 'false'),
  ('auto_generate_reports', 'true')
ON CONFLICT (key) DO NOTHING;
