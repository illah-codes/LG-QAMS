-- Link existing staff records to their corresponding auth.users records
-- This updates staff.auth_user_id based on matching email addresses

UPDATE staff
SET auth_user_id = auth.users.id
FROM auth.users
WHERE staff.email = auth.users.email
  AND staff.auth_user_id IS NULL;

-- Verify the update
-- SELECT s.email, s.auth_user_id, au.id as auth_user_id_match
-- FROM staff s
-- LEFT JOIN auth.users au ON s.email = au.email
-- WHERE s.auth_user_id IS NULL;

