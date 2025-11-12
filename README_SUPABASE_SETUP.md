# Supabase Database Setup Guide

This guide explains how to set up your Supabase database by running migrations and seed data.

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Get your credentials**:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (found in Settings > API)

## Option 1: Using Supabase Dashboard (Recommended for Beginners)

### Step 1: Access SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migrations in Order

Run each SQL file in this exact order:

1. **001_create_enums.sql** - Creates ENUM types

   ```sql
   -- Copy and paste the entire content of supabase/migrations/001_create_enums.sql
   ```

   Click **Run** (or press Cmd/Ctrl + Enter)

2. **002_create_tables.sql** - Creates all tables

   ```sql
   -- Copy and paste the entire content of supabase/migrations/002_create_tables.sql
   ```

   Click **Run**

3. **003_create_indexes.sql** - Creates indexes for performance

   ```sql
   -- Copy and paste the entire content of supabase/migrations/003_create_indexes.sql
   ```

   Click **Run**

4. **004_enable_rls.sql** - Enables Row Level Security and creates policies

   ```sql
   -- Copy and paste the entire content of supabase/migrations/004_enable_rls.sql
   ```

   Click **Run**

5. **005_seed_data.sql** - Seeds default settings
   ```sql
   -- Copy and paste the entire content of supabase/migrations/005_seed_data.sql
   ```
   Click **Run**

### Step 3: Create Initial Admin User

After running migrations, you need to create an admin user:

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add User** > **Create New User**
3. Enter:
   - **Email**: `admin@lg.gov` (or your preferred admin email)
   - **Password**: Choose a secure password
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create User**
5. Copy the User ID (UUID) from the created user

6. Go back to **SQL Editor** and run:

   ```sql
   INSERT INTO staff (staff_id, auth_user_id, name, email, department, role, status)
   VALUES (
     'LGADM001',  -- Custom staff ID (use format like LG234E33)
     'YOUR_USER_ID_HERE',  -- Replace with the UUID from step 5 (auth user ID)
     'Admin User',
     'admin@lg.gov',  -- Must match the email from step 3
     'IT',
     'Admin',
     'active'
   )
   ON CONFLICT (staff_id) DO NOTHING;
   ```

   **Note**: Staff ID is now a custom format (e.g., `LG234E33`, `LGADM001`). The `auth_user_id` field links to the Supabase Auth user UUID.

## Option 2: Using Supabase CLI (For Advanced Users)

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### Link Your Project

```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref
```

### Run Migrations

```bash
# Push all migrations to remote database
supabase db push

# Or run migrations individually
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Option 3: Using Node.js Script (Alternative)

Create a script to run migrations programmatically:

### Setup Script

```bash
npm install --save-dev pg
```

Create `scripts/run-migrations.js`:

```javascript
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

const migrations = [
  '001_create_enums.sql',
  '002_create_tables.sql',
  '003_create_indexes.sql',
  '004_enable_rls.sql',
  '005_seed_data.sql',
];

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Please set DATABASE_URL environment variable');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    for (const migration of migrations) {
      const sql = readFileSync(join(__dirname, '../supabase/migrations', migration), 'utf8');

      console.log(`Running ${migration}...`);
      await client.query(sql);
      console.log(`✓ ${migration} completed`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
```

Run it:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" node scripts/run-migrations.js
```

## Verify Setup

After running migrations, verify everything is set up correctly:

1. **Check Tables**: Go to **Table Editor** in Supabase Dashboard
   - You should see: `staff`, `attendance`, `settings`, `reports`

2. **Check Settings**: Run this query:

   ```sql
   SELECT * FROM settings;
   ```

   You should see default settings for office hours, etc.

3. **Check RLS**: Go to **Authentication** > **Policies**
   - Verify RLS is enabled on all tables
   - Check that policies exist

## Troubleshooting

### Error: "type already exists"

- The ENUM types were already created. Skip `001_create_enums.sql` or drop them first.

### Error: "relation already exists"

- Tables already exist. Either:
  - Drop all tables and rerun, or
  - Use `CREATE TABLE IF NOT EXISTS` (modify migrations)

### Error: "permission denied"

- Make sure you're using the correct database connection
- For RLS policies, ensure you're authenticated as an admin

### RLS Policies Not Working

- Make sure RLS is enabled: `ALTER TABLE staff ENABLE ROW LEVEL SECURITY;`
- Verify policies exist in **Authentication** > **Policies**

## Next Steps

After migrations are complete:

1. Create your `.env` file:

   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Test the application:

   ```bash
   npm run dev
   ```

3. Login with your admin credentials created in Step 3 above.

## Important Notes

- **Never commit `.env` file** to version control
- **Keep service_role key secret** - never use it in client-side code
- **Test RLS policies** - ensure staff can only access their own data
- **Backup your database** before making changes in production
