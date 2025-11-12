/**
 * Backup Service - Data export functionality
 */

import { getAllStaff } from './staff.js';
import { getAllAttendance } from './attendance.js';
import { getAllSettings } from './settings.js';
import { getSavedReports } from './reports.js';

/**
 * Export all system data to JSON format
 * @returns {Promise<{data: string|null, error: Error|null}>}
 */
export async function exportData() {
  try {
    // Fetch all data from different tables
    const [staffResult, attendanceResult, settingsResult, reportsResult] = await Promise.all([
      getAllStaff(),
      getAllAttendance(),
      getAllSettings(),
      getSavedReports(),
    ]);

    // Check for errors
    if (staffResult.error) {
      return {
        data: null,
        error: new Error(`Failed to fetch staff: ${staffResult.error.message}`),
      };
    }
    if (attendanceResult.error) {
      return {
        data: null,
        error: new Error(`Failed to fetch attendance: ${attendanceResult.error.message}`),
      };
    }
    if (settingsResult.error) {
      return {
        data: null,
        error: new Error(`Failed to fetch settings: ${settingsResult.error.message}`),
      };
    }
    if (reportsResult.error) {
      return {
        data: null,
        error: new Error(`Failed to fetch reports: ${reportsResult.error.message}`),
      };
    }

    // Structure the backup data
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        staff: staffResult.data || [],
        attendance: attendanceResult.data || [],
        settings: settingsResult.data || {},
        reports: reportsResult.data || [],
      },
    };

    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(backupData, null, 2);

    return { data: jsonData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Download backup data as JSON file
 * @param {string} jsonData - JSON string to download
 * @param {string} filename - Optional filename (defaults to lg-qams-backup-YYYY-MM-DD.json)
 */
export function downloadBackup(jsonData, filename = null) {
  try {
    // Generate filename if not provided
    if (!filename) {
      const today = new Date().toISOString().split('T')[0];
      filename = `lg-qams-backup-${today}.json`;
    }

    // Create Blob from JSON data
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error downloading backup:', error);
    throw error;
  }
}
