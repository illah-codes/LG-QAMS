/**
 * Attendance Service - Attendance operations
 */

import { supabase } from '../config/supabase.js';
import { getOfficeHours } from './settings.js';

/**
 * Check if current time is within office hours
 * @param {string} officeStartTime - Office start time (HH:MM format)
 * @param {string} officeEndTime - Office end time (HH:MM format)
 * @returns {boolean} True if within office hours, false otherwise
 */
function isWithinOfficeHours(officeStartTime, officeEndTime) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  const [startHours, startMinutes] = officeStartTime.split(':').map(Number);
  const [endHours, endMinutes] = officeEndTime.split(':').map(Number);

  const startTime = startHours * 60 + startMinutes;
  const endTime = endHours * 60 + endMinutes;

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Record check-in
 * @param {string} staffId - Staff UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function recordCheckIn(staffId) {
  try {
    // Log for debugging
    // eslint-disable-next-line no-console
    console.log('recordCheckIn called with staffId:', staffId);

    // Verify staffId is a valid UUID
    if (!staffId || typeof staffId !== 'string') {
      return {
        data: null,
        error: new Error('Invalid staff ID provided'),
      };
    }

    // Check if user is admin - admins do not need to check in/out
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('role')
      .eq('id', staffId)
      .maybeSingle();

    if (staffError) {
      return {
        data: null,
        error: new Error('Failed to verify staff role'),
      };
    }

    if (staff && staff.role === 'Admin') {
      return {
        data: null,
        error: new Error('Admins do not need to check in/out'),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Get office hours settings
    const { data: officeHours, error: officeHoursError } = await getOfficeHours();
    if (officeHoursError) {
      return {
        data: null,
        error: new Error('Failed to retrieve office hours settings'),
      };
    }

    const officeStartTime = officeHours?.start || '08:00';
    const officeEndTime = officeHours?.end || '17:00';
    const lateThreshold = officeHours?.lateThreshold || 15;

    // Validate office hours - check if current time is within office hours
    if (!isWithinOfficeHours(officeStartTime, officeEndTime)) {
      return {
        data: null,
        error: new Error(
          `Check-in is only allowed during office hours (${officeStartTime} - ${officeEndTime}). Current time is outside office hours.`
        ),
      };
    }

    // Calculate if late
    const [hours, minutes] = officeStartTime.split(':');
    const officeStart = new Date();
    officeStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const checkInTime = new Date(now);
    const isLate = checkInTime > new Date(officeStart.getTime() + lateThreshold * 60000);

    // Check if already has attendance for today
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      // If already checked in and not checked out, return error
      // User should check out instead of checking in again
      if (existing.check_in_time && !existing.check_out_time) {
        return {
          data: null,
          error: new Error('Already checked in today. Please check out first.'),
        };
      }

      // If already checked in and checked out, prevent multiple check-ins/outs
      if (existing.check_in_time && existing.check_out_time) {
        return {
          data: null,
          error: new Error(
            'You have already checked in and checked out today. Only one check-in and one check-out per day is allowed.'
          ),
        };
      }

      // If no check-in time exists (shouldn't happen, but handle it)
      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_in_time: now,
          is_late: isLate,
          status: 'Present',
          updated_at: now,
        })
        .eq('id', existing.id)
        .select()
        .maybeSingle();

      return { data, error };
    }

    // Create new attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        staff_id: staffId,
        date: today,
        check_in_time: now,
        is_late: isLate,
        status: 'Present',
      })
      .select()
      .maybeSingle();

    // Enhanced error logging for RLS issues
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Attendance insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        staffId,
      });

      // Provide helpful error message for RLS violations
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        // eslint-disable-next-line no-console
        console.error('RLS Policy Violation - Troubleshooting:');
        // eslint-disable-next-line no-console
        console.error('1. Ensure migration 010_fix_attendance_rls.sql has been run');
        // eslint-disable-next-line no-console
        console.error(
          '2. Verify staff record has auth_user_id linked (run migration 008 if needed)'
        );
        // eslint-disable-next-line no-console
        console.error('3. Check that staff status is "active"');
        // eslint-disable-next-line no-console
        console.error('4. Ensure staffId is staff.id (UUID), not auth.users.id');
      }
    }

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Record check-out
 * @param {string} staffId - Staff UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function recordCheckOut(staffId) {
  try {
    // Log for debugging
    // eslint-disable-next-line no-console
    console.log('recordCheckOut called with staffId:', staffId);

    // Verify staffId is a valid UUID
    if (!staffId || typeof staffId !== 'string') {
      return {
        data: null,
        error: new Error('Invalid staff ID provided'),
      };
    }

    // Check if user is admin - admins do not need to check in/out
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('role')
      .eq('id', staffId)
      .maybeSingle();

    if (staffError) {
      return {
        data: null,
        error: new Error('Failed to verify staff role'),
      };
    }

    if (staff && staff.role === 'Admin') {
      return {
        data: null,
        error: new Error('Admins do not need to check in/out'),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check-out is allowed anytime - no office hours restriction
    // Staff may work late and need to check out after office hours

    // Get today's attendance
    const { data: attendance, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', today)
      .maybeSingle();

    if (fetchError) {
      // eslint-disable-next-line no-console
      console.error('Error fetching attendance for check-out:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        staffId,
        today,
      });
      return {
        data: null,
        error: new Error(`Failed to fetch attendance record: ${fetchError.message}`),
      };
    }

    if (!attendance) {
      // eslint-disable-next-line no-console
      console.warn('No attendance record found for check-out:', { staffId, today });
      return {
        data: null,
        error: new Error('No check-in found for today. Please check in first.'),
      };
    }

    // Validate that check-in time exists
    if (!attendance.check_in_time) {
      // eslint-disable-next-line no-console
      console.warn('Attendance record exists but has no check-in time:', {
        attendanceId: attendance.id,
        staffId,
        date: attendance.date,
      });
      return {
        data: null,
        error: new Error('Invalid attendance record: missing check-in time'),
      };
    }

    if (attendance.check_out_time) {
      // eslint-disable-next-line no-console
      console.warn('Attempted check-out but already checked out:', {
        attendanceId: attendance.id,
        staffId,
        checkOutTime: attendance.check_out_time,
      });
      return {
        data: null,
        error: new Error('Already checked out today'),
      };
    }

    // Update with check-out time
    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out_time: now,
        updated_at: now,
      })
      .eq('id', attendance.id)
      .select()
      .maybeSingle();

    if (error) {
      // Enhanced error logging for RLS violations
      // eslint-disable-next-line no-console
      console.error('Error updating attendance for check-out:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        attendanceId: attendance.id,
        staffId,
      });

      // Provide helpful error message for RLS violations
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        // eslint-disable-next-line no-console
        console.error('RLS Policy Violation - Troubleshooting:');
        // eslint-disable-next-line no-console
        console.error('1. Check if RLS is enabled on attendance table');
        // eslint-disable-next-line no-console
        console.error(
          '2. Verify UPDATE policy exists and allows staff to update their own records'
        );
        // eslint-disable-next-line no-console
        console.error(
          '3. If RLS is causing issues, consider running migration 011_disable_attendance_rls.sql'
        );
        return {
          data: null,
          error: new Error(
            `Check-out failed due to security policy. Please contact administrator. Error: ${error.message}`
          ),
        };
      }

      return {
        data: null,
        error: new Error(`Failed to record check-out: ${error.message}`),
      };
    }

    // Log successful check-out
    // eslint-disable-next-line no-console
    console.log('Check-out recorded successfully:', {
      attendanceId: data?.id,
      staffId,
      checkOutTime: data?.check_out_time,
      date: data?.date,
    });

    return { data, error: null };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Exception in recordCheckOut:', error);
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('An unexpected error occurred during check-out'),
    };
  }
}

/**
 * Get attendance by staff ID
 * @param {string} staffId - Staff UUID
 * @param {Object} filters - Filter options
 * @param {string} filters.startDate - Start date (ISO format)
 * @param {string} filters.endDate - End date (ISO format)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getAttendanceByStaff(staffId, filters = {}) {
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('staff_id', staffId)
    .order('date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Get all attendance records (admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getAllAttendance(filters = {}) {
  // Extract pagination parameters (default: page=1, limit=10)
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('attendance')
    .select(
      `
      *,
      staff:staff_id (
        id,
        staff_id,
        name,
        email,
        department
      )
    `,
      { count: 'exact' }
    )
    .order('date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }

  if (filters.department) {
    // Filter by department - need to filter on the joined staff relation
    // Since we can't directly filter on nested relations in Supabase,
    // we need to get staff IDs first, then filter attendance
    const { data: staffInDept, error: staffError } = await supabase
      .from('staff')
      .select('id')
      .eq('department', filters.department)
      .eq('status', 'active');

    if (staffError) {
      return { data: null, totalCount: 0, error: staffError };
    }

    if (staffInDept && staffInDept.length > 0) {
      const staffIds = staffInDept.map((s) => s.id);
      query = query.in('staff_id', staffIds);
    } else {
      // No staff in this department, return empty result
      return { data: [], totalCount: 0, error: null };
    }
  }

  if (filters.staffId) {
    // staffId can be either UUID or staff_id (custom format)
    // Try UUID first, then fall back to staff_id lookup
    const { data: staffByCustomId } = await supabase
      .from('staff')
      .select('id')
      .eq('staff_id', filters.staffId)
      .maybeSingle();

    if (staffByCustomId) {
      query = query.eq('staff_id', staffByCustomId.id);
    } else {
      // Assume it's a UUID
      query = query.eq('staff_id', filters.staffId);
    }
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, totalCount: count || 0, error };
}

/**
 * Get today's attendance overview (admin)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getTodayAttendance(filters = {}) {
  // Always calculate today's date fresh (not cached) to ensure we get current day's data
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Extract pagination parameters for staff list (default: page=1, limit=10)
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: attendance, error } = await supabase
    .from('attendance')
    .select(
      `
      *,
      staff:staff_id (
        id,
        staff_id,
        name,
        department
      )
    `,
      { count: 'exact' }
    )
    .eq('date', today)
    .order('check_in_time', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Get all active staff (including admins for total count)
  const { data: allStaff } = await supabase
    .from('staff')
    .select('id, role, created_at')
    .eq('status', 'active');

  // Filter out admins and staff created today for absence calculations
  // Newly created staff shouldn't be marked absent immediately
  const todayDate = today; // Use the already calculated today date
  const nonAdminStaff =
    allStaff?.filter((s) => {
      if (s.role === 'Admin') return false; // Exclude admins
      // Exclude staff created today - they're new and shouldn't be marked absent yet
      const staffCreatedDate = s.created_at
        ? new Date(s.created_at).toISOString().split('T')[0]
        : null;
      return staffCreatedDate !== todayDate; // Only include staff created before today
    }) || [];
  const totalStaff = allStaff?.length || 0; // Includes admins
  const totalNonAdminStaff = nonAdminStaff.length; // Excludes admins and staff created today

  // Get non-admin staff IDs for filtering attendance
  const nonAdminStaffIds = nonAdminStaff.map((s) => s.id);

  // Filter attendance to exclude admins when counting present
  const nonAdminAttendance =
    attendance?.filter((a) => a.staff_id && nonAdminStaffIds.includes(a.staff_id)) || [];

  const presentCount = nonAdminAttendance.filter((a) => a.check_in_time).length || 0;
  const lateCount = nonAdminAttendance.filter((a) => a.is_late).length || 0;

  // Get office hours to determine if we should count absences
  const { data: officeHours } = await getOfficeHours();
  const officeStartTime = officeHours?.start || '08:00';

  // Calculate absent count - sync with office hours
  // Only count absences if current time is at or past office hours start
  let absentCount = 0;
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
  const [startHours, startMinutes] = officeStartTime.split(':').map(Number);
  const officeStartMinutes = startHours * 60 + startMinutes;

  // Only count absences if current time is at or past office hours start
  // This ensures we don't mark staff as absent before office hours begin
  if (currentTime >= officeStartMinutes) {
    // Verify: Count only staff who haven't checked in
    // (nonAdminStaff - staff who have checked in = absent)
    absentCount = Math.max(0, totalNonAdminStaff - presentCount);
  } else {
    // Before office hours - no one should be marked as absent yet
    // Staff still have time to check in
    absentCount = 0;
  }

  // Paginate the staff list
  const allStaffList =
    attendance?.map((a) => ({
      id: a.staff.staff_id,
      name: a.staff.name,
      department: a.staff.department || 'N/A',
      checkIn: a.check_in_time
        ? new Date(a.check_in_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
        : null,
      checkOut: a.check_out_time
        ? new Date(a.check_out_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
        : null,
      status: a.check_in_time ? 'Present' : 'Absent',
    })) || [];

  const totalStaffCount = allStaffList.length;
  const paginatedStaff = allStaffList.slice(from, to + 1);

  return {
    data: {
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      total: totalStaff,
      staff: paginatedStaff,
      totalStaffCount: totalStaffCount,
    },
    error: null,
  };
}

/**
 * Check if staff has checked in today
 * @param {string} staffId - Staff UUID
 * @returns {Promise<{hasCheckedIn: boolean, data: Object|null, error: Error|null}>}
 */
export async function hasCheckedInToday(staffId) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('staff_id', staffId)
    .eq('date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    return { hasCheckedIn: false, data: null, error };
  }

  return {
    hasCheckedIn: !!data,
    data: data || null,
    error: null,
  };
}

/**
 * Get attendance statistics for a staff member
 * @param {string} staffId - Staff UUID
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getStaffStatistics(staffId, month) {
  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1))
    .toISOString()
    .split('T')[0];

  // Fetch staff role and creation date to check if admin and calculate working days correctly
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('role, created_at')
    .eq('id', staffId)
    .maybeSingle();

  if (staffError) {
    // If we can't get staff record, log but continue (might be edge case)
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch staff role:', staffError);
  }

  const isAdmin = staff?.role === 'Admin';

  const { data: attendance, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('staff_id', staffId)
    .gte('date', startDate)
    .lt('date', endDate);

  if (error) {
    return { data: null, error };
  }

  const presentDays = attendance?.filter((a) => a.status === 'Present').length || 0;
  const lateness = attendance?.filter((a) => a.is_late).length || 0;

  // Calculate total days in the month using the correct year and month
  const startDateObj = new Date(startDate);
  const totalDaysInMonth = new Date(
    startDateObj.getFullYear(),
    startDateObj.getMonth() + 1,
    0
  ).getDate();

  // Count only weekdays (Monday-Friday), excluding weekends (Saturday and Sunday)
  // Only count from staff's creation date (newly created staff shouldn't be marked absent for days before creation)
  let totalWorkingDays = 0;
  const today = new Date();
  const isCurrentMonth =
    startDateObj.getFullYear() === today.getFullYear() &&
    startDateObj.getMonth() === today.getMonth();
  let endDay = isCurrentMonth ? today.getDate() : totalDaysInMonth;

  // Sync with office hours for current month
  // If it's the current month and office hours haven't started yet today, exclude today from working days
  if (isCurrentMonth) {
    const { data: officeHours } = await getOfficeHours();
    const officeStartTime = officeHours?.start || '08:00';
    const currentTime = today.getHours() * 60 + today.getMinutes(); // Convert to minutes
    const [startHours, startMinutes] = officeStartTime.split(':').map(Number);
    const officeStartMinutes = startHours * 60 + startMinutes;

    // If office hours haven't started yet today, exclude today from working days
    // This ensures staff aren't marked absent before office hours begin
    if (currentTime < officeStartMinutes) {
      endDay = today.getDate() - 1; // Count up to yesterday only
    }
  }

  // Calculate start day based on staff creation date
  // If staff was created during this month, start counting from creation day
  // Otherwise, start from day 1 (staff existed before this month)
  let startDay = 1;
  if (staff?.created_at) {
    const staffCreatedDate = new Date(staff.created_at);
    const staffCreatedYear = staffCreatedDate.getFullYear();
    const staffCreatedMonth = staffCreatedDate.getMonth();
    const reportYear = startDateObj.getFullYear();
    const reportMonth = startDateObj.getMonth();

    // If staff was created in the same month as the report, start from creation day
    if (staffCreatedYear === reportYear && staffCreatedMonth === reportMonth) {
      startDay = staffCreatedDate.getDate();
    }
    // If staff was created after the report month, they shouldn't have any working days
    else if (
      staffCreatedYear > reportYear ||
      (staffCreatedYear === reportYear && staffCreatedMonth > reportMonth)
    ) {
      startDay = endDay + 1; // Set to beyond endDay so loop doesn't execute
    }
    // Otherwise, staff was created before this month, start from day 1
  }

  // Loop through each day and count only weekdays, starting from staff creation day
  for (let day = startDay; day <= endDay; day++) {
    const date = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalWorkingDays++;
    }
  }

  // Calculate average check-in time
  const checkInTimes = attendance
    ?.filter((a) => a.check_in_time)
    .map((a) => new Date(a.check_in_time).getHours() * 60 + new Date(a.check_in_time).getMinutes());

  const avgCheckInMinutes =
    checkInTimes && checkInTimes.length > 0
      ? Math.round(checkInTimes.reduce((sum, time) => sum + time, 0) / checkInTimes.length)
      : null;

  const averageCheckIn = avgCheckInMinutes
    ? `${Math.floor(avgCheckInMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(avgCheckInMinutes % 60).toString().padStart(2, '0')} AM`
    : 'N/A';

  // Calculate average check-out time
  const checkOutTimes = attendance
    ?.filter((a) => a.check_out_time)
    .map(
      (a) => new Date(a.check_out_time).getHours() * 60 + new Date(a.check_out_time).getMinutes()
    );

  const avgCheckOutMinutes =
    checkOutTimes && checkOutTimes.length > 0
      ? Math.round(checkOutTimes.reduce((sum, time) => sum + time, 0) / checkOutTimes.length)
      : null;

  const averageCheckOut = avgCheckOutMinutes
    ? `${Math.floor(avgCheckOutMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(avgCheckOutMinutes % 60).toString().padStart(2, '0')} PM`
    : 'N/A';

  // Calculate absences: 0 for admins, normal calculation for staff
  const absences = isAdmin ? 0 : totalWorkingDays - presentDays;

  return {
    data: {
      totalWorkingDays,
      presentDays,
      absences,
      lateness,
      averageCheckIn,
      averageCheckOut,
    },
    error: null,
  };
}
