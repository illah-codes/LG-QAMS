/**
 * Authentication Service using Supabase Auth
 */

import { supabase } from '../config/supabase.js';

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function signIn(email, password) {
  try {
    // Sign in directly with Supabase Auth using email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      return { user: null, error: new Error('Invalid email or password') };
    }

    // Get staff profile using authenticated user's email
    const { data: staffProfile, error: profileError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      // PGRST116 means no rows found
      if (profileError.code === 'PGRST116' || profileError.message?.includes('0 rows')) {
        return { user: null, error: new Error('Staff profile not found for this account') };
      }
      return { user: null, error: profileError };
    }

    if (!staffProfile) {
      return { user: null, error: new Error('Staff profile not found for this account') };
    }

    if (staffProfile.status !== 'active') {
      return { user: null, error: new Error('Account is inactive') };
    }

    return { user: { ...staffProfile, authUser: authData.user }, error: null };
  } catch (error) {
    return { user: null, error: error };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{error: Error|null}>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current authenticated user
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return { user: null, error: authError };
    }

    // Get staff profile using email
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle(); // Use maybeSingle() to handle 0 rows gracefully

    if (staffError) {
      // PGRST116 means no rows found
      if (staffError.code === 'PGRST116' || staffError.message?.includes('0 rows')) {
        return { user: null, error: new Error('Staff profile not found for this account') };
      }
      return { user: null, error: staffError };
    }

    if (!staff) {
      return { user: null, error: new Error('Staff profile not found for this account') };
    }

    return { user: { ...staff, authUser }, error: null };
  } catch (error) {
    return { user: null, error: error };
  }
}

/**
 * Get current session
 * @returns {Promise<{session: Object|null, error: Error|null}>}
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { session } = await getSession();
  return !!session;
}

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const { user } = await getCurrentUser();
  return user?.role === 'Admin';
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function called on auth state change
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{error: Error|null}>}
 */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

/**
 * Reset password (send reset email)
 * @param {string} email - User email
 * @returns {Promise<{error: Error|null}>}
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
}
