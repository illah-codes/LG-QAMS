/**
 * Attendance Page Initialization Utility
 * Handles loading departments and staff for filter dropdowns
 */

/**
 * Initialize attendance page
 * Loads departments and staff for filter dropdowns
 */
export async function initAttendancePage() {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const departmentSelect = document.getElementById('filter-department');

    if (departmentSelect) {
      try {
        // Load departments from staff table
        await loadDepartments();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading departments:', error);
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Department select not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Load all unique departments from staff table
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

    const departmentSelect = document.getElementById('filter-department');
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
