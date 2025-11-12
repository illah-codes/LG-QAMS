# Fix Attendance Check-In Error - Simple Steps

## The Error

When you try to check in, you get: `"new row violates row-level security policy for table 'attendance'"`

## Step 1: Run the Fix Migration

1. Open Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL the text from file: `010_fix_attendance_rls.sql`
5. Paste it into the SQL Editor
6. Click **Run** button
7. You should see: "Success. No rows returned"

## Step 2: Check if it worked

Run this query in SQL Editor:

```sql
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_insert_attendance_for_staff')
    THEN 'GOOD - Migration worked'
    ELSE 'PROBLEM - Try running migration again'
  END as result;
```

If it says "GOOD", move to Step 3.

## Step 3: Check your staff record

Replace `your-email@example.com` with the email you use to login, then run:

```sql
SELECT
  id,
  name,
  email,
  auth_user_id,
  status
FROM staff
WHERE email = 'your-email@example.com';
```

Look at the results:

- **If `auth_user_id` is NULL**: You need to link it (see Step 4)
- **If `status` is not `'active'`**: You need to change it (see Step 5)

## Step 4: Link staff to auth user (if needed)

Only do this if Step 3 showed `auth_user_id` is NULL.

Replace `your-email@example.com` with your email, then run:

```sql
UPDATE staff
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
)
WHERE email = 'your-email@example.com'
  AND auth_user_id IS NULL;
```

## Step 5: Set status to active (if needed)

Only do this if Step 3 showed `status` is not `'active'`.

Replace `your-email@example.com` with your email, then run:

```sql
UPDATE staff
SET status = 'active'
WHERE email = 'your-email@example.com';
```

## Step 6: Try checking in again

After completing all steps, try to check in/out in your application. It should work now!
