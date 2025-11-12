/**
 * Run Supabase Migrations Script
 *
 * Usage:
 * DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" node scripts/run-migrations.js
 */

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
    console.error(
      'Please set DATABASE_URL environment variable.\n' +
        'Example: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"'
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    for (const migration of migrations) {
      const sql = readFileSync(join(__dirname, '../supabase/migrations', migration), 'utf8');

      console.log(`Running ${migration}...`);
      await client.query(sql);
      console.log(`✓ ${migration} completed\n`);
    }

    console.log('🎉 All migrations completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Create an admin user in Supabase Auth dashboard');
    console.log('2. Insert the admin staff record with matching email');
    console.log('3. Set up your .env file with Supabase credentials');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
