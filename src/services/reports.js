/**
 * Reports Service - Report generation and statistics
 */

import { supabase } from '../config/supabase.js';
import { getStaffStatistics } from './attendance.js';

/**
 * Generate monthly report for staff
 * @param {string} staffId - Staff UUID
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function generateMonthlyReport(staffId, month) {
  const stats = await getStaffStatistics(staffId, month);

  if (stats.error) {
    return stats;
  }

  // Get staff details
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('name, email, department, role')
    .eq('id', staffId)
    .maybeSingle();

  if (staffError || !staff) {
    return { data: null, error: staffError || new Error('Staff not found') };
  }

  return {
    data: {
      month,
      staff: staff.name,
      department: staff.department,
      role: staff.role || 'Staff',
      ...stats.data,
    },
    error: null,
  };
}

/**
 * Generate departmental report
 * @param {string} department - Department name
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function generateDepartmentalReport(department, month) {
  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1))
    .toISOString()
    .split('T')[0];

  // Get all staff - filter by department if provided, otherwise get all active staff
  let query = supabase
    .from('staff')
    .select('id, staff_id, name, email, role, department')
    .eq('status', 'active');

  if (department && department.trim() !== '') {
    query = query.eq('department', department);
  }

  const { data: staffList, error: staffError } = await query;

  if (staffError) {
    return { data: null, error: staffError };
  }

  if (!staffList || staffList.length === 0) {
    return {
      data: {
        month,
        department: department || 'All Departments',
        reports: [],
        totalStaff: 0,
      },
      error: null,
    };
  }

  // Get attendance for all staff in the month
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .in(
      'staff_id',
      staffList.map((s) => s.id)
    )
    .gte('date', startDate)
    .lt('date', endDate);

  if (attendanceError) {
    return { data: null, error: attendanceError };
  }

  // Calculate statistics for each staff
  const reports = staffList.map((staff) => {
    const staffAttendance = attendance.filter((a) => a.staff_id === staff.id);
    const presentDays = staffAttendance.filter((a) => a.status === 'Present').length;
    const lateness = staffAttendance.filter((a) => a.is_late).length;
    const totalWorkingDays = new Date(new Date(startDate).getMonth() + 1, 0).getDate();

    return {
      staffId: staff.staff_id,
      name: staff.name,
      email: staff.email,
      role: staff.role || 'Staff',
      department: staff.department || 'N/A',
      totalWorkingDays,
      presentDays,
      absences: totalWorkingDays - presentDays,
      lateness,
    };
  });

  return {
    data: {
      month,
      department: department || 'All Departments',
      reports,
      totalStaff: staffList.length,
    },
    error: null,
  };
}

/**
 * Save report metadata
 * @param {Object} reportData - Report data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function saveReport(reportData) {
  const { data, error } = await supabase.from('reports').insert(reportData).select().maybeSingle();

  return { data, error };
}

/**
 * Get saved reports
 * @param {string} staffId - Staff UUID (optional)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getSavedReports(staffId = null, filters = {}) {
  // Extract pagination parameters (default: page=1, limit=10)
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, totalCount: count || 0, error };
}
