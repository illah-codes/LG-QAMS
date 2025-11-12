/**
 * Success Page Initialization Utility
 * Handles updating the success page with URL parameters
 * This ensures the page updates when navigating back to it with different parameters
 */

/**
 * Update success page with data from URL parameters
 * This function reads the current URL parameters and updates the page display
 */
export function initSuccessPage() {
  // Get data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  const time = urlParams.get('time');
  const action = urlParams.get('action');
  const department = urlParams.get('department');
  const staffId = urlParams.get('staffId');

  // Debug: Log all values
  // eslint-disable-next-line no-console
  console.log('Success page init - URL params:', {
    name,
    time,
    action,
    department,
    staffId,
    fullSearch: window.location.search,
    fullURL: window.location.href,
    pathname: window.location.pathname,
    allParams: Array.from(urlParams.entries()),
  });

  // Get DOM elements
  const nameEl = document.getElementById('staff-name');
  const timeEl = document.getElementById('timestamp');
  const actionEl = document.getElementById('action-type');
  const departmentEl = document.getElementById('staff-department');
  const staffIdEl = document.getElementById('staff-id');

  // Check if required elements exist
  if (!nameEl || !timeEl || !actionEl) {
    // eslint-disable-next-line no-console
    console.warn('Success page elements not found, page may not be loaded yet');
    return;
  }

  // Only update if we have the required parameters
  if (!name || !time || !action) {
    // eslint-disable-next-line no-console
    console.warn('Missing required URL parameters:', { name, time, action });
    // Set defaults as fallback
    if (nameEl) nameEl.textContent = 'User';
    if (timeEl)
      timeEl.textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    if (actionEl) actionEl.textContent = 'Check-In';
    if (departmentEl) departmentEl.textContent = 'N/A';
    if (staffIdEl) staffIdEl.textContent = 'N/A';
    return;
  }

  // Set values
  const displayName = decodeURIComponent(name);
  const displayTime = decodeURIComponent(time);
  const displayAction = decodeURIComponent(action);
  const displayDepartment = department ? decodeURIComponent(department) : 'N/A';
  const displayStaffId = staffId ? decodeURIComponent(staffId) : 'N/A';

  // Update DOM elements
  nameEl.textContent = displayName;
  timeEl.textContent = displayTime;
  actionEl.textContent = displayAction;
  if (departmentEl) departmentEl.textContent = displayDepartment;
  if (staffIdEl) staffIdEl.textContent = displayStaffId;

  // eslint-disable-next-line no-console
  console.log('Success page - Display values set:', {
    displayName,
    displayTime,
    displayAction,
    displayDepartment,
    displayStaffId,
  });
}
