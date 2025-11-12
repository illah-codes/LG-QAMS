/**
 * Settings Service - System configuration management
 */

import { supabase } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';

/**
 * Get all settings
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getAllSettings() {
  const { data, error } = await supabase.from('settings').select('*');

  if (error) {
    return { data: null, error };
  }

  // Convert array to object
  const settingsObj = {};
  data.forEach((setting) => {
    settingsObj[setting.key] = setting.value;
  });

  return { data: settingsObj, error: null };
}

/**
 * Get a specific setting
 * @param {string} key - Setting key
 * @returns {Promise<{data: any|null, error: Error|null}>}
 */
export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    // Handle "not found" errors gracefully
    if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
      return { data: null, error: null };
    }
    return { data: null, error };
  }

  return { data: data?.value || null, error: null };
}

/**
 * Update a setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateSetting(key, value) {
  const { user } = await getCurrentUser();

  if (!user || user.role !== 'Admin') {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const { data, error } = await supabase
    .from('settings')
    .upsert(
      {
        key,
        value,
        updated_by: user.id,
      },
      {
        onConflict: 'key',
      }
    )
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Update multiple settings
 * @param {Object} settings - Object with key-value pairs
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function updateSettings(settings) {
  const { user } = await getCurrentUser();

  if (!user || user.role !== 'Admin') {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_by: user.id,
  }));

  const { data, error } = await supabase
    .from('settings')
    .upsert(updates, {
      onConflict: 'key',
    })
    .select();

  return { data, error };
}

/**
 * Get office hours settings
 * @returns {Promise<{data: {start: string, end: string, lateThreshold: number}|null, error: Error|null}>}
 */
export async function getOfficeHours() {
  const [startTime, endTime, threshold] = await Promise.all([
    getSetting('office_start_time'),
    getSetting('office_end_time'),
    getSetting('late_threshold_minutes'),
  ]);

  if (startTime.error || endTime.error || threshold.error) {
    return {
      data: null,
      error: new Error('Failed to fetch office hours settings'),
    };
  }

  return {
    data: {
      start: startTime.data || '08:00',
      end: endTime.data || '17:00',
      lateThreshold: parseInt(threshold.data || '15'),
    },
    error: null,
  };
}
