/**
 * Restore Service - Data import functionality
 */

import { supabase } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';

/**
 * Validate backup file structure
 * @param {Object} backupData - Parsed backup JSON object
 * @returns {Promise<{valid: boolean, error: string|null, metadata: Object|null}>}
 */
export async function validateBackupFile(backupData) {
  try {
    // Check if backupData is an object
    if (!backupData || typeof backupData !== 'object') {
      return {
        valid: false,
        error: 'Invalid backup file: Not a valid JSON object',
        metadata: null,
      };
    }

    // Check for required fields
    if (!backupData.version) {
      return {
        valid: false,
        error: 'Invalid backup file: Missing version field',
        metadata: null,
      };
    }

    if (!backupData.exportedAt) {
      return {
        valid: false,
        error: 'Invalid backup file: Missing exportedAt field',
        metadata: null,
      };
    }

    if (!backupData.data || typeof backupData.data !== 'object') {
      return {
        valid: false,
        error: 'Invalid backup file: Missing or invalid data field',
        metadata: null,
      };
    }

    // Check data structure
    const { data } = backupData;
    if (!Array.isArray(data.staff)) {
      return {
        valid: false,
        error: 'Invalid backup file: staff data must be an array',
        metadata: null,
      };
    }

    if (!Array.isArray(data.attendance)) {
      return {
        valid: false,
        error: 'Invalid backup file: attendance data must be an array',
        metadata: null,
      };
    }

    if (!Array.isArray(data.reports)) {
      return {
        valid: false,
        error: 'Invalid backup file: reports data must be an array',
        metadata: null,
      };
    }

    // Return valid with metadata
    return {
      valid: true,
      error: null,
      metadata: {
        version: backupData.version,
        exportedAt: backupData.exportedAt,
        staffCount: data.staff?.length || 0,
        attendanceCount: data.attendance?.length || 0,
        reportsCount: data.reports?.length || 0,
        settingsCount: Object.keys(data.settings || {}).length,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error.message}`,
      metadata: null,
    };
  }
}

/**
 * Restore data from backup file
 * @param {Object} backupData - Parsed backup JSON object
 * @param {Object} options - Restore options
 * @param {boolean} options.overwriteExisting - Whether to overwrite existing records
 * @returns {Promise<{success: boolean, error: Error|null, stats: Object|null}>}
 */
export async function restoreData(backupData, options = { overwriteExisting: false }) {
  try {
    // Validate backup file first
    const validation = await validateBackupFile(backupData);
    if (!validation.valid) {
      return {
        success: false,
        error: new Error(validation.error),
        stats: null,
      };
    }

    // Check if user is admin
    const { user } = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return {
        success: false,
        error: new Error('Unauthorized: Admin access required'),
        stats: null,
      };
    }

    const { data } = backupData;
    const stats = {
      staff: { inserted: 0, updated: 0, errors: 0 },
      attendance: { inserted: 0, errors: 0 },
      settings: { updated: 0, errors: 0 },
      reports: { inserted: 0, errors: 0 },
    };

    // Restore staff (handle conflicts based on staff_id)
    if (data.staff && data.staff.length > 0) {
      for (const staff of data.staff) {
        try {
          // Check if staff with same staff_id exists
          const { data: existing } = await supabase
            .from('staff')
            .select('id')
            .eq('staff_id', staff.staff_id)
            .maybeSingle();

          if (existing && options.overwriteExisting) {
            // Update existing staff
            const { error: updateError } = await supabase
              .from('staff')
              .update({
                name: staff.name,
                email: staff.email,
                department: staff.department,
                role: staff.role,
                status: staff.status,
                // Don't update auth_user_id as it's linked to auth.users
              })
              .eq('id', existing.id);

            if (updateError) {
              stats.staff.errors++;
            } else {
              stats.staff.updated++;
            }
          } else if (!existing) {
            // Insert new staff (without auth_user_id - will need to be linked manually)
            const { error: insertError } = await supabase.from('staff').insert({
              staff_id: staff.staff_id,
              name: staff.name,
              email: staff.email,
              department: staff.department,
              role: staff.role,
              status: staff.status,
              auth_user_id: null, // Will need to be linked manually
            });

            if (insertError) {
              stats.staff.errors++;
            } else {
              stats.staff.inserted++;
            }
          }
        } catch (error) {
          stats.staff.errors++;
          // eslint-disable-next-line no-console
          console.error('Error restoring staff:', error);
        }
      }
    }

    // Restore attendance (only if overwriteExisting is true, otherwise skip duplicates)
    if (data.attendance && data.attendance.length > 0) {
      for (const attendance of data.attendance) {
        try {
          // Check if attendance record exists (by staff_id, date)
          const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('staff_id', attendance.staff_id)
            .eq('date', attendance.date)
            .maybeSingle();

          if (!existing) {
            // Insert new attendance record
            const { error: insertError } = await supabase.from('attendance').insert({
              staff_id: attendance.staff_id,
              date: attendance.date,
              check_in_time: attendance.check_in_time,
              check_out_time: attendance.check_out_time,
              status: attendance.status,
              is_late: attendance.is_late,
            });

            if (insertError) {
              stats.attendance.errors++;
            } else {
              stats.attendance.inserted++;
            }
          } else if (options.overwriteExisting) {
            // Update existing attendance
            const { error: updateError } = await supabase
              .from('attendance')
              .update({
                check_in_time: attendance.check_in_time,
                check_out_time: attendance.check_out_time,
                status: attendance.status,
                is_late: attendance.is_late,
              })
              .eq('id', existing.id);

            if (updateError) {
              stats.attendance.errors++;
            } else {
              stats.attendance.inserted++; // Count as inserted for stats
            }
          }
        } catch (error) {
          stats.attendance.errors++;
          // eslint-disable-next-line no-console
          console.error('Error restoring attendance:', error);
        }
      }
    }

    // Restore settings (always update)
    if (data.settings && typeof data.settings === 'object') {
      for (const [key, value] of Object.entries(data.settings)) {
        try {
          const { error: upsertError } = await supabase.from('settings').upsert(
            {
              key,
              value,
              updated_by: user.id,
            },
            {
              onConflict: 'key',
            }
          );

          if (upsertError) {
            stats.settings.errors++;
          } else {
            stats.settings.updated++;
          }
        } catch (error) {
          stats.settings.errors++;
          // eslint-disable-next-line no-console
          console.error('Error restoring setting:', error);
        }
      }
    }

    // Restore reports
    if (data.reports && data.reports.length > 0) {
      for (const report of data.reports) {
        try {
          // Insert report (reports table likely doesn't have unique constraints)
          const { error: insertError } = await supabase.from('reports').insert(report);

          if (insertError) {
            stats.reports.errors++;
          } else {
            stats.reports.inserted++;
          }
        } catch (error) {
          stats.reports.errors++;
          // eslint-disable-next-line no-console
          console.error('Error restoring report:', error);
        }
      }
    }

    return {
      success: true,
      error: null,
      stats,
    };
  } catch (error) {
    return {
      success: false,
      error,
      stats: null,
    };
  }
}
