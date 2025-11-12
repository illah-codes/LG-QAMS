/**
 * Dashboard Initialization Utilities
 * Handles data loading for dashboard pages
 */

/**
 * Initialize staff dashboard
 * Waits for DOM elements and loads attendance data
 */
export async function initStaffDashboard() {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const statsContainer = document.getElementById('stats-cards');
    const tableBody = document.getElementById('recent-attendance-table');
    const userNameElement = document.getElementById('user-name');

    if (statsContainer && tableBody && userNameElement) {
      try {
        const { createAttendanceCard } = await import(
          '/src/components/attendance-card/attendance-card.js'
        );
        const { getCurrentUser } = await import('/src/services/auth.js');
        const { getAttendanceByStaff, getStaffStatistics } = await import(
          '/src/services/attendance.js'
        );

        // Get current user
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) {
          // eslint-disable-next-line no-console
          console.error('Failed to get user:', userError);
          return;
        }

        userNameElement.textContent = user.name;

        // Get current month statistics
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: stats } = await getStaffStatistics(user.id, currentMonth);

        // Clear and create stat cards
        statsContainer.innerHTML = '';
        const cards = [
          createAttendanceCard({
            title: 'Present Days',
            value: stats?.presentDays || 0,
            icon: '✅',
            color: 'success',
          }),
          createAttendanceCard({
            title: 'Absences',
            value: Math.max(0, stats?.absences || 0),
            icon: '❌',
            color: 'danger',
          }),
          createAttendanceCard({
            title: 'Lateness',
            value: stats?.lateness || 0,
            icon: '⏰',
            color: 'warning',
          }),
          createAttendanceCard({
            title: 'Total Working Days',
            value: stats?.totalWorkingDays || 0,
            icon: '📅',
            color: 'info',
          }),
        ];
        cards.forEach((card) => statsContainer.appendChild(card));

        // Populate recent attendance
        const { data: attendance, error: attError } = await getAttendanceByStaff(user.id);
        if (attError) {
          // eslint-disable-next-line no-console
          console.error('Failed to load attendance:', attError);
          return;
        }

        tableBody.innerHTML = '';

        if (attendance && attendance.length > 0) {
          attendance.slice(0, 5).forEach((record) => {
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
            tableBody.appendChild(row);
          });
        } else {
          tableBody.innerHTML =
            '<tr><td colspan="4" class="text-center text-secondary p-6">No attendance records found</td></tr>';
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading dashboard:', error);
      }
    } else if (retries < maxRetries) {
      // Elements not found yet, retry after a short delay
      retries++;
      setTimeout(tryInit, 50);
    }
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    // DOM already loaded, try immediately
    tryInit();
  }
}

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let totalPages = 0;

/**
 * Initialize admin dashboard
 * Waits for DOM elements and loads today's attendance data with pagination
 */
export async function initAdminDashboard(page = 1) {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const statsContainer = document.getElementById('today-stats');
    const tableBody = document.getElementById('today-attendance-table');
    const todayDateElement = document.getElementById('today-date');

    if (statsContainer && tableBody && todayDateElement) {
      try {
        const { createAttendanceCard } = await import(
          '/src/components/attendance-card/attendance-card.js'
        );
        const { getTodayAttendance } = await import('/src/services/attendance.js');

        // Set today's date
        todayDateElement.textContent = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Get today's attendance with pagination
        // Always fetch fresh data (no caching) to ensure we get today's attendance, not yesterday's
        const { data: today, error } = await getTodayAttendance({
          page: page,
          limit: itemsPerPage,
        });
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load attendance:', error);
          return;
        }

        // Update pagination state
        currentPage = page;
        totalCount = today.totalStaffCount || 0;
        totalPages = Math.ceil(totalCount / itemsPerPage);

        // Clear and create stat cards
        statsContainer.innerHTML = '';
        const cards = [
          createAttendanceCard({
            title: 'Present Today',
            value: today.present || 0,
            icon: '✅',
            color: 'success',
          }),
          createAttendanceCard({
            title: 'Absent Today',
            value: Math.max(0, today.absent || 0), // Ensure it's never negative
            icon: '❌',
            color: 'danger',
          }),
          createAttendanceCard({
            title: 'Late Today',
            value: today.late || 0,
            icon: '⏰',
            color: 'warning',
          }),
          createAttendanceCard({
            title: 'Total Staff',
            value: today.total || 0,
            icon: '👥',
            color: 'info',
          }),
        ];
        cards.forEach((card) => statsContainer.appendChild(card));

        // Populate today's attendance table
        tableBody.innerHTML = '';

        if (today.staff && today.staff.length > 0) {
          today.staff.forEach((staff) => {
            const row = document.createElement('tr');
            const statusBadge =
              staff.status === 'Present'
                ? '<span class="badge badge-success">Present</span>'
                : '<span class="badge badge-secondary">Absent</span>';
            row.innerHTML = `
              <td>${staff.name}</td>
              <td>${staff.department || 'N/A'}</td>
              <td>${staff.checkIn || '-'}</td>
              <td>${staff.checkOut || '-'}</td>
              <td>${statusBadge}</td>
            `;
            tableBody.appendChild(row);
          });
        } else {
          tableBody.innerHTML =
            '<tr><td colspan="5" class="text-center text-secondary p-6">No attendance records for today</td></tr>';
        }

        // Render pagination
        renderPagination();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading dashboard:', error);
      }
    } else if (retries < maxRetries) {
      // Elements not found yet, retry after a short delay
      retries++;
      setTimeout(tryInit, 50);
    }
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    // DOM already loaded, try immediately
    tryInit();
  }
}

/**
 * Render pagination controls
 */
function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  // Don't show pagination if no records or only one page
  if (totalPages <= 1) {
    if (totalCount > 0) {
      // Show page info even if only one page
      const pageInfo = document.createElement('span');
      pageInfo.className = 'text-secondary p-4';
      pageInfo.textContent = `Page 1 of 1 (${totalCount} records)`;
      container.appendChild(pageInfo);
    }
    return;
  }

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => previousPage();
  container.appendChild(prevBtn);

  // Page number buttons
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  pageNumbers.forEach((pageNum) => {
    if (pageNum === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'text-secondary p-2';
      ellipsis.textContent = '...';
      container.appendChild(ellipsis);
    } else {
      const pageBtn = document.createElement('button');
      pageBtn.className = pageNum === currentPage ? 'btn btn-primary' : 'btn btn-outline';
      pageBtn.textContent = pageNum;
      pageBtn.onclick = () => goToPage(pageNum);
      container.appendChild(pageBtn);
    }
  });

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => nextPage();
  container.appendChild(nextBtn);

  // Page info
  const pageInfo = document.createElement('span');
  pageInfo.className = 'text-secondary p-4';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  container.appendChild(pageInfo);
}

/**
 * Get page numbers to display
 */
function getPageNumbers(current, total) {
  const pages = [];
  const maxVisible = 7; // Show up to 7 page numbers

  if (total <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show pages around current page
    if (current <= 4) {
      // Near the beginning
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      // Near the end
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // In the middle
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
}

/**
 * Go to a specific page
 */
function goToPage(page) {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    initAdminDashboard(page);
  }
}

/**
 * Go to previous page
 */
function previousPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

/**
 * Go to next page
 */
function nextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

// Export functions for use in page script
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
