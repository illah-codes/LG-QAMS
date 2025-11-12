/**
 * Staff Attendance Page Initialization Utility
 * Handles loading and displaying staff attendance history
 */

import { getCurrentUser } from '../services/auth.js';
import { getAttendanceByStaff } from '../services/attendance.js';

let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 10;
let allAttendance = [];
let currentUser = null;

/**
 * Load attendance data for current staff user
 */
async function loadAttendance() {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      // eslint-disable-next-line no-console
      console.error('Failed to get user:', error);
      return;
    }

    currentUser = user;

    // Calculate date range based on filter
    let startDate = null;
    let endDate = null;
    const today = new Date();

    if (currentFilter === 'daily') {
      startDate = today.toISOString().split('T')[0];
      endDate = startDate;
    } else if (currentFilter === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else if (currentFilter === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }

    const { data, error: attError } = await getAttendanceByStaff(user.id, {
      startDate,
      endDate,
    });

    if (attError) {
      // eslint-disable-next-line no-console
      console.error('Failed to load attendance:', attError);
      return;
    }

    allAttendance = data || [];
    renderTable();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading attendance:', error);
  }
}

/**
 * Render attendance table
 */
function renderTable() {
  const tbody = document.getElementById('attendance-table-body');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';

  if (allAttendance.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-secondary p-6">No attendance records found</td></tr>';
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    if (currentPageEl) currentPageEl.textContent = '1';
    if (totalPagesEl) totalPagesEl.textContent = '1';
    return;
  }

  const paginated = allAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  paginated.forEach((record) => {
    const row = document.createElement('tr');
    const checkInTime = record.check_in_time
      ? new Date(record.check_in_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '-';
    const checkOutTime = record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '-';
    const statusBadge = record.is_late
      ? '<span class="badge badge-warning">Late</span>'
      : '<span class="badge badge-success">Present</span>';
    row.innerHTML = `
      <td>${record.date}</td>
      <td>${checkInTime}</td>
      <td>${checkOutTime}</td>
      <td>${statusBadge}</td>
    `;
    tbody.appendChild(row);
  });

  const totalPages = Math.ceil(allAttendance.length / itemsPerPage);
  const currentPageEl = document.getElementById('current-page');
  const totalPagesEl = document.getElementById('total-pages');
  if (currentPageEl) currentPageEl.textContent = currentPage;
  if (totalPagesEl) totalPagesEl.textContent = totalPages || 1;
}

/**
 * Initialize staff attendance page
 * Loads and displays attendance data
 */
export async function initStaffAttendancePage() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const tbody = document.getElementById('attendance-table-body');

    if (tbody) {
      try {
        // Reset to default state
        currentFilter = 'all';
        currentPage = 1;
        allAttendance = [];
        currentUser = null;

        // Load attendance data
        await loadAttendance();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing staff attendance page:', error);
        if (tbody) {
          tbody.innerHTML =
            '<tr><td colspan="4" class="text-center text-secondary p-6">Error loading attendance. Please refresh the page.</td></tr>';
        }
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Attendance table body not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Filter attendance by period
 * @param {string} filter - Filter type ('all', 'daily', 'weekly', 'monthly')
 */
export function filterAttendance(filter) {
  currentFilter = filter;
  currentPage = 1;
  loadAttendance();

  // Update button states
  document.querySelectorAll('.btn-outline, .btn-primary').forEach((btn) => {
    btn.className = 'btn btn-outline';
  });

  // Find and activate the button that matches the filter
  const buttons = document.querySelectorAll('button[onclick*="filterAttendance"]');
  buttons.forEach((btn) => {
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes(`filterAttendance('${filter}')`)) {
      btn.className = 'btn btn-primary';
    }
  });
}

/**
 * Go to previous page
 */
export function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

/**
 * Go to next page
 */
export function nextPage() {
  const totalPages = Math.ceil(allAttendance.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

// Export functions to window for use in inline onclick handlers
window.filterAttendance = filterAttendance;
window.previousPage = previousPage;
window.nextPage = nextPage;
