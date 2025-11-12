-- Sync staff.email to auth.users.email when staff.email is updated
-- This ensures that when an admin updates a staff member's email,
-- the auth user's email is also updated so they can log in with the new email

-- Function to sync staff.email to auth.users.email when staff.email is updated
CREATE OR REPLACE FUNCTION sync_staff_email_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if email changed and auth_user_id exists
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.auth_user_id IS NOT NULL THEN
    -- Update auth.users.email using the auth_user_id
    UPDATE auth.users
    SET email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.auth_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function on staff table updates
CREATE TRIGGER sync_staff_email_trigger
  AFTER UPDATE OF email ON staff
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION sync_staff_email_to_auth();

