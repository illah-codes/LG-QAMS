/**
 * Staff Reports Page Initialization Utility
 * Handles loading and displaying staff monthly reports
 */

import { getCurrentUser } from '../services/auth.js';
import { generateMonthlyReport, getSavedReports } from '../services/reports.js';

/**
 * Load and render reports for current staff user
 */
async function loadReports() {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      // eslint-disable-next-line no-console
      console.error('Failed to get user:', error);
      return;
    }

    // Get saved reports
    const { data: savedReports } = await getSavedReports(user.id);

    // Generate current month report
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: currentReport } = await generateMonthlyReport(user.id, currentMonth);

    renderReports([currentReport, ...(savedReports || [])]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading reports:', error);
  }
}

/**
 * Render reports in the reports list container
 * @param {Array} reports - Array of report objects
 */
function renderReports(reports) {
  const container = document.getElementById('reports-list');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!reports || reports.length === 0) {
    container.innerHTML = '<p class="text-secondary">No reports available</p>';
    return;
  }

  reports.forEach((report) => {
    const reportCard = document.createElement('div');
    reportCard.className = 'card shadow-sm mb-4';
    reportCard.innerHTML = `
      <div class="card-body p-6">
        <div class="flex-between mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">${report.month || 'Report'}</h3>
            <p class="text-secondary text-sm">Attendance Summary Report</p>
          </div>
          <div class="flex flex-gap-2">
            <button class="btn btn-primary btn-sm" onclick="downloadReport('pdf', '${report.month}')">PDF</button>
            <button class="btn btn-outline btn-sm" onclick="downloadReport('excel', '${report.month}')">Excel</button>
          </div>
        </div>
        <div class="grid-auto-fit-sm">
          <div>
            <p class="text-secondary text-sm mb-1">Total Days</p>
            <p class="text-lg font-bold">${report.totalWorkingDays || 0}</p>
          </div>
          <div>
            <p class="text-secondary text-sm mb-1">Present</p>
            <p class="text-lg font-bold text-success">${report.presentDays || 0}</p>
          </div>
          <div>
            <p class="text-secondary text-sm mb-1">Absent</p>
            <p class="text-lg font-bold text-danger">${report.absences || 0}</p>
          </div>
          <div>
            <p class="text-secondary text-sm mb-1">Average Check-In</p>
            <p class="text-lg font-bold">${report.averageCheckIn || 'N/A'}</p>
          </div>
        </div>
      </div>
    `;
    container.appendChild(reportCard);
  });
}

/**
 * Initialize staff reports page
 * Loads and displays reports data
 */
export async function initStaffReportsPage() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const reportsList = document.getElementById('reports-list');

    if (reportsList) {
      try {
        // Load reports data
        await loadReports();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing staff reports page:', error);
        if (reportsList) {
          reportsList.innerHTML =
            '<p class="text-secondary">Error loading reports. Please refresh the page.</p>';
        }
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Reports list container not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Reload reports (called after generating a new report)
 */
export async function reloadReports() {
  await loadReports();
}
