/**
 * Staff Management Page Initialization Utility
 * Handles loading and displaying staff list with pagination
 */

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let totalPages = 0;
let currentSearch = '';

/**
 * Initialize staff management page
 * Loads and displays staff members with pagination
 */
export async function initStaffManagementPage(page = 1) {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const staffTableBody = document.getElementById('staff-table-body');

    if (staffTableBody) {
      try {
        const { getAllStaff } = await import('/src/services/staff.js');

        // Load staff with pagination
        const {
          data: staffList,
          totalCount: count,
          error,
        } = await getAllStaff({
          page: page,
          limit: itemsPerPage,
        });

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load staff:', error);
          staffTableBody.innerHTML =
            '<tr><td colspan="7" class="text-center text-secondary p-6">Failed to load staff. Please try again.</td></tr>';
          return;
        }

        // Update pagination state
        currentPage = page;
        totalCount = count || 0;
        totalPages = Math.ceil(totalCount / itemsPerPage);

        // Store staff list globally for filter function (for search)
        window.allStaff = staffList || [];

        // Render staff table and pagination
        renderStaffTable(staffList || []);
        renderPagination();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing staff page:', error);
        staffTableBody.innerHTML =
          '<tr><td colspan="7" class="text-center text-secondary p-6">Error loading staff. Please refresh the page.</td></tr>';
      }
    } else {
      // Elements not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Staff table body not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Render staff table
 * @param {Array} staffList - Array of staff objects
 */
function renderStaffTable(staffList) {
  const tbody = document.getElementById('staff-table-body');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';

  if (staffList.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-secondary p-6">No staff found</td></tr>';
    return;
  }

  staffList.forEach((staff) => {
    const row = document.createElement('tr');
    const statusBadge =
      staff.status === 'active'
        ? '<span class="badge badge-success">Active</span>'
        : '<span class="badge badge-secondary">Inactive</span>';

    // Show Activate button for inactive staff, Deactivate button for active staff
    const actionButton =
      staff.status === 'active'
        ? `<button class="btn btn-sm btn-danger" onclick="deactivateStaffById('${staff.id}')">Deactivate</button>`
        : `<button class="btn btn-sm btn-success" onclick="reactivateStaffById('${staff.id}')">Activate</button>`;

    row.innerHTML = `
      <td>${staff.staff_id}</td>
      <td>${staff.name}</td>
      <td>${staff.email}</td>
      <td>${staff.department}</td>
      <td>${staff.role}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="flex flex-gap-2">
          <button class="btn btn-sm btn-outline" onclick="editStaff('${staff.id}')">Edit</button>
          ${actionButton}
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
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
    initStaffManagementPage(page);
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
window.renderStaffTable = renderStaffTable;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
