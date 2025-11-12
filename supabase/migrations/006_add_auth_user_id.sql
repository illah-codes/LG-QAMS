-- Migration to add auth_user_id column to existing staff table
-- Run this if you already created the staff table without auth_user_id

-- Add auth_user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE staff 
    ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Create index for auth_user_id
    CREATE INDEX idx_staff_auth_user_id ON staff(auth_user_id);
  END IF;
END $$;

