/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only throw error if we're in production or if explicitly set to required mode
// For development, allow missing env vars with warning
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE === 'production') {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      'Supabase environment variables not set. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
