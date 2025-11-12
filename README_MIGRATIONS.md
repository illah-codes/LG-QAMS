# Quick Start: Running Migrations

## Method 1: Supabase Dashboard (Easiest) ⭐

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste each migration file content in order:
   - `001_create_enums.sql`
   - `002_create_tables.sql`
   - `003_create_indexes.sql`
   - `004_enable_rls.sql`
   - `005_seed_data.sql`
   - `006_add_auth_user_id.sql` (only if staff table already exists)
   - `008_link_existing_staff_to_auth_users.sql` (links staff to auth.users by email)
   - `009_revert_migration_007.sql` (IMPORTANT: Fixes permission errors - run this if you previously ran migration 007)
   - `010_fix_attendance_rls.sql` (Fixes attendance RLS policy for check-in/out)
   - `011_disable_attendance_rls.sql` (Disables RLS on attendance table - removes security restrictions)
   - `012_fix_settings_rls.sql` (Fixes settings RLS policy with explicit WITH CHECK clause)
   - `013_fix_reports_rls.sql` (Fixes reports RLS policy with explicit USING and WITH CHECK clauses)
   - `014_fix_staff_update_rls.sql` (Fixes staff UPDATE RLS policy with explicit WITH CHECK clause)
   - `015_sync_staff_email_to_auth.sql` (Syncs staff.email to auth.users.email when admin updates staff email)

   **Note**: Migration 007 (`fix_staff_rls_for_signin.sql`) causes permission errors and should NOT be run. Migration 009 reverts any 007 changes.

4. Click **Run** after each file

## Method 2: Using Node Script

1. Install dependencies:

   ```bash
   npm install --save-dev pg
   ```

2. Get your database connection string from Supabase:
   - Go to **Settings** → **Database**
   - Copy the connection string (Connection Pooling or Direct Connection)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. Run migrations:
   ```bash
   DATABASE_URL="your-connection-string" npm run migrate
   ```

## After Migrations

1. **Create Admin User in Supabase Auth**:
   - Go to **Authentication** → **Users** → **Add User**
   - Email: `admin@lg.gov`
   - Password: (choose secure password)
   - Auto Confirm: ✅
   - Copy the User ID (UUID)

2. **Create Admin Staff Record**:
   - Go to **SQL Editor**
   - Run (replace values):
     ```sql
     INSERT INTO staff (staff_id, auth_user_id, name, email, department, role, status)
     VALUES (
       'LGADM001',  -- Custom staff ID (format: LG234E33)
       'PASTE_AUTH_USER_UUID_HERE',  -- UUID from step 1
       'Admin User',
       'admin@lg.gov',  -- Must match email from step 1
       'IT',
       'Admin',
       'active'
     );
     ```

3. **Set up .env file**:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Test login**:
   ```bash
   npm run dev
   ```
   Login with: Email = your email, Password = your password

## Troubleshooting

### Empty Staff Query Results

If `getAllStaff()` returns an empty array even though data exists in the database:

1. **Check if `auth_user_id` is linked**: Run in SQL Editor:

   ```sql
   SELECT s.email, s.auth_user_id, au.id as auth_user_id_from_auth
   FROM staff s
   LEFT JOIN auth.users au ON s.email = au.email;
   ```

2. **If `auth_user_id` is NULL**: Run migration `008_link_existing_staff_to_auth_users.sql` to link existing records

3. **Verify RLS policies**: Check active policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'staff';
   ```

### Permission Errors

If you see `"permission denied for table users"` error:

- **Cause**: Migration 007 tried to query `auth.users` table which is not allowed in RLS policies
- **Fix**: Run migration `009_revert_migration_007.sql` to restore the correct simple policies
- **Note**: Migration 007 should NOT be run. The original migration 004 policies work correctly when `auth_user_id` is populated

### Disable RLS on Attendance (Quick Fix)

**If you want to disable RLS on attendance table completely:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `011_disable_attendance_rls.sql`
3. Click Run
4. This removes all RLS restrictions on attendance table

**Note:** This means any authenticated user can insert/update/select any attendance record. Use for development/testing. For production, consider keeping RLS enabled with proper policies.

**To re-enable RLS later:** Run `011_re_enable_attendance_rls.sql`

### Attendance RLS Policy Violation

If you see `"new row violates row-level security policy for table 'attendance'"` error when checking in/out:

**Step 1: Run Migration 010**

- Go to Supabase Dashboard → SQL Editor
- Copy and paste contents of `010_fix_attendance_rls.sql`
- Click Run

**Step 2: Verify Migration Applied**

- Run the simple check query from `010_simple_check.sql` in SQL Editor

**Step 3: Check Staff Record Setup**

- Ensure staff record has `auth_user_id` properly linked (run migration 008 if `auth_user_id` is NULL)
- Verify staff status is 'active'
- Confirm the check-in flow uses `staff.id` (UUID from staff table), not `auth.users.id`

**Common Issues:**

- **Migration not run**: Run `010_fix_attendance_rls.sql` in SQL Editor
- **Missing auth_user_id**: Run migration `008_link_existing_staff_to_auth_users.sql`
- **Inactive staff**: Update staff record: `UPDATE staff SET status = 'active' WHERE email = 'your-email@example.com';`
- **Wrong ID used**: Ensure attendance service receives `staff.id` (UUID), not `auth.users.id`

For step-by-step instructions, see `supabase/migrations/010_fix_attendance_rls_SIMPLE.md`

### Settings RLS Policy Violation

If you see `"new row violates row-level security policy for table 'settings'"` error when trying to save settings:

**Step 1: Run Migration 012**

- Go to Supabase Dashboard → SQL Editor
- Copy and paste contents of `012_fix_settings_rls.sql`
- Click Run

**Step 2: Verify Migration Applied**

- Run this query in SQL Editor to check if the policy was updated:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'settings';
  ```
- You should see a policy named "Admins can manage settings" with both `using_expression` and `with_check_expression` set

**Common Issues:**

- **Migration not run**: Run `012_fix_settings_rls.sql` in SQL Editor
- **Not logged in as admin**: Ensure you're logged in with an account that has `role = 'Admin'` in the staff table
- **Missing auth_user_id**: Run migration `008_link_existing_staff_to_auth_users.sql` to link your staff record to auth user

### Reports RLS Policy Violation

If you see `"new row violates row-level security policy for table 'reports'"` error when trying to save a report:

**Step 1: Run Migration 013**

- Go to Supabase Dashboard → SQL Editor
- Copy and paste contents of `013_fix_reports_rls.sql`
- Click Run

**Step 2: Verify Migration Applied**

- Run this query in SQL Editor to check if the policy was updated:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'reports';
  ```
- You should see a policy named "Admins can create reports" with both `using_expression` and `with_check_expression` set

**Common Issues:**

- **Migration not run**: Run `013_fix_reports_rls.sql` in SQL Editor
- **Not logged in as admin**: Ensure you're logged in with an account that has `role = 'Admin'` in the staff table
- **Missing auth_user_id**: Run migration `008_link_existing_staff_to_auth_users.sql` to link your staff record to auth user

### Staff Email Update Not Syncing to Auth

If an admin updates a staff member's email but the staff cannot log in with the new email:

**Step 1: Run Migration 015**

- Go to Supabase Dashboard → SQL Editor
- Copy and paste contents of `015_sync_staff_email_to_auth.sql`
- Click Run

**Step 2: Verify Trigger Created**

- Run this query in SQL Editor to check if the trigger exists:
  ```sql
  SELECT trigger_name, event_manipulation, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name = 'sync_staff_email_trigger';
  ```
- You should see the trigger listed

**Step 3: Test Email Sync**

- Update a staff member's email in the admin panel
- Check if `auth.users.email` was updated:
  ```sql
  SELECT s.email as staff_email, au.email as auth_email, s.auth_user_id
  FROM staff s
  JOIN auth.users au ON s.auth_user_id = au.id
  WHERE s.id = 'staff-uuid-here';
  ```
- Both emails should match

**Common Issues:**

- **Migration not run**: Run `015_sync_staff_email_to_auth.sql` in SQL Editor
- **Missing auth_user_id**: The trigger only works if `staff.auth_user_id` is set. Run migration `008_link_existing_staff_to_auth_users.sql` to link staff records
- **Trigger not firing**: Ensure the trigger was created successfully and check for any errors in the Supabase logs

---

For detailed instructions, see `README_SUPABASE_SETUP.md`
