/**
 * Reports Page Initialization Utility
 * Handles loading and displaying generated reports with pagination
 */

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let totalPages = 0;

/**
 * Load staff list for report generation dropdown
 */
async function loadStaffForReports() {
  const maxRetries = 10;
  let retries = 0;

  const tryLoad = async () => {
    const staffSelect = document.getElementById('report-staff');

    if (!staffSelect) {
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryLoad, 50 * retries);
      }
      return;
    }

    try {
      const { getAllStaff } = await import('/src/services/staff.js');

      // Get all staff with large limit to get all records
      const { data: staffList, error } = await getAllStaff({
        page: 1,
        limit: 1000, // Large limit to get all staff
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load staff:', error);
        return;
      }

      // Clear existing options except "Select Staff Member"
      staffSelect.innerHTML = '<option value="">Select Staff Member</option>';

      // Add staff as options
      if (staffList && staffList.length > 0) {
        // Sort by name
        const sortedStaff = [...staffList].sort((a, b) => a.name.localeCompare(b.name));

        sortedStaff.forEach((staff) => {
          const option = document.createElement('option');
          option.value = staff.id;
          option.textContent = `${staff.name} (${staff.staff_id}) - ${staff.department || 'N/A'}`;
          staffSelect.appendChild(option);
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading staff:', error);
    }
  };

  tryLoad();
}

/**
 * Handle report type change - show/hide appropriate fields
 */
function handleReportTypeChange() {
  const reportType = document.getElementById('report-type');
  if (!reportType) return;

  const type = reportType.value;
  const staffContainer = document.getElementById('staff-selection-container');
  const departmentContainer = document.getElementById('department-selection-container');
  const staffSelect = document.getElementById('report-staff');
  const departmentSelect = document.getElementById('report-department');

  if (type === 'monthly') {
    // Monthly report uses department selection (optional - can be "All Departments")
    if (staffContainer) {
      staffContainer.classList.add('hidden');
    }
    if (departmentContainer) {
      departmentContainer.classList.remove('hidden');
    }
    // Make staff not required
    if (staffSelect) {
      staffSelect.required = false;
    }
    // Make department optional (not required - can be "All Departments")
    if (departmentSelect) {
      departmentSelect.required = false;
    }
  } else if (type === 'individual') {
    // Individual report uses department selection (optional - can be "All Departments")
    if (staffContainer) {
      staffContainer.classList.add('hidden');
    }
    if (departmentContainer) {
      departmentContainer.classList.remove('hidden');
    }
    // Make staff not required
    if (staffSelect) {
      staffSelect.required = false;
    }
    // Make department optional (not required - can be "All Departments")
    if (departmentSelect) {
      departmentSelect.required = false;
    }
  } else if (type === 'departmental') {
    // Departmental report uses department selection (optional - can be "All Departments")
    if (staffContainer) {
      staffContainer.classList.add('hidden');
    }
    if (departmentContainer) {
      departmentContainer.classList.remove('hidden');
    }
    // Make staff not required
    if (staffSelect) {
      staffSelect.required = false;
    }
    // Make department optional (not required - can be "All Departments")
    if (departmentSelect) {
      departmentSelect.required = false;
    }
  }
}

/**
 * Initialize reports page form (staff dropdown, report type handler)
 */
export async function initReportsPageForm() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const reportTypeSelect = document.getElementById('report-type');
    const staffContainer = document.getElementById('staff-selection-container');
    const departmentContainer = document.getElementById('department-selection-container');

    if (reportTypeSelect && staffContainer && departmentContainer) {
      // Load staff list first
      await loadStaffForReports();

      // Add event listener to report type dropdown
      // Remove existing listeners by cloning (preserves selected value)
      const currentValue = reportTypeSelect.value;
      const newReportTypeSelect = reportTypeSelect.cloneNode(true);
      newReportTypeSelect.value = currentValue; // Preserve selected value
      reportTypeSelect.parentNode.replaceChild(newReportTypeSelect, reportTypeSelect);
      newReportTypeSelect.addEventListener('change', handleReportTypeChange);

      // Set initial state based on current selection
      handleReportTypeChange();
    } else {
      // Elements not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries);
      } else {
        // eslint-disable-next-line no-console
        console.error('Reports form elements not found after max retries');
      }
    }
  };

  // Small delay to ensure DOM is ready after route change
  setTimeout(() => {
    tryInit();
  }, 50);
}

/**
 * Load all unique departments from staff table for reports page
 */
async function loadDepartments() {
  try {
    const { getUniqueDepartments } = await import('/src/services/staff.js');
    const { data: departments, error } = await getUniqueDepartments();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load departments:', error);
      return;
    }

    const departmentSelect = document.getElementById('report-department');
    if (!departmentSelect) {
      return;
    }

    // Clear existing options except "All Departments"
    departmentSelect.innerHTML = '<option value="">All Departments</option>';

    // Add departments as options
    if (departments && departments.length > 0) {
      departments.forEach((dept) => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading departments:', error);
  }
}

/**
 * Initialize admin reports page
 * Loads and displays generated reports with pagination
 */
export async function initAdminReports(page = 1) {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const reportsContainer = document.getElementById('generated-reports');
    const departmentSelect = document.getElementById('report-department');

    if (reportsContainer) {
      try {
        // Load departments first
        if (departmentSelect) {
          await loadDepartments();
        }

        const { getSavedReports } = await import('/src/services/reports.js');

        // Load saved reports with pagination (no staffId filter for admin)
        const {
          data: reports,
          totalCount: count,
          error,
        } = await getSavedReports(null, {
          page: page,
          limit: itemsPerPage,
        });

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load reports:', error);
          reportsContainer.innerHTML =
            '<p class="text-secondary">Failed to load reports. Please try again.</p>';
          return;
        }

        // Update pagination state
        currentPage = page;
        totalCount = count || 0;
        totalPages = Math.ceil(totalCount / itemsPerPage);

        // Render reports and pagination
        renderReports(reports || []);
        renderPagination();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing reports:', error);
        reportsContainer.innerHTML =
          '<p class="text-secondary">Error loading reports. Please refresh the page.</p>';
      }
    } else {
      // Elements not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Reports container not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Render reports in the container
 * @param {Array} reports - Array of report objects
 */
function renderReports(reports) {
  const container = document.getElementById('generated-reports');
  if (!container) {
    return;
  }

  // Clear existing content but keep the title
  const title = container.querySelector('h2');
  container.innerHTML = '';
  if (title) {
    container.appendChild(title);
  } else {
    // Add title if it doesn't exist
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title mb-4';
    titleEl.textContent = 'Generated Reports';
    container.appendChild(titleEl);
  }

  if (!reports || reports.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'text-secondary';
    emptyMessage.textContent = 'No reports generated yet. Generate a report to see it here.';
    container.appendChild(emptyMessage);
    return;
  }

  // Create reports list - 2 columns with 5 cards per column
  const reportsList = document.createElement('div');
  reportsList.className = 'grid-2-col';

  reports.forEach((report) => {
    const reportCard = document.createElement('div');
    reportCard.className = 'card shadow-sm';

    // Format date
    const createdDate = report.created_at
      ? new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      : 'Unknown date';

    // Format month
    const reportMonth = report.month
      ? new Date(report.month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
      : 'Unknown month';

    // Format report type
    const reportTypeLabels = {
      monthly: 'Monthly Report',
      departmental: 'Departmental Report',
      individual: 'Individual Staff Report',
    };
    const reportTypeLabel = reportTypeLabels[report.report_type] || report.report_type || 'Report';

    reportCard.innerHTML = `
      <div class="card-body p-3">
        <div>
          <h3 class="text-base font-semibold mb-1">${reportTypeLabel}</h3>
          <p class="text-secondary text-xs mb-1">
            <span class="font-medium">Month:</span> ${reportMonth}
          </p>
          ${report.department ? `<p class="text-secondary text-xs mb-1"><span class="font-medium">Dept:</span> ${report.department}</p>` : ''}
          <p class="text-secondary text-xs">
            <span class="font-medium">Date:</span> ${createdDate}
          </p>
        </div>
      </div>
    `;

    reportsList.appendChild(reportCard);
  });

  container.appendChild(reportsList);
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
      pageInfo.textContent = `Page 1 of 1 (${totalCount} reports)`;
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
    initAdminReports(page);
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
window.renderReports = renderReports;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
