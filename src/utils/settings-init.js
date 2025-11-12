/**
 * Settings Page Initialization Utility
 * Handles loading and populating settings form values
 */

/**
 * Initialize settings page
 * Waits for DOM elements and loads settings data
 */
export async function initSettingsPage() {
  // Wait for DOM to be ready and elements to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const officeStartInput = document.getElementById('office-start');
    const officeEndInput = document.getElementById('office-end');
    const lateThresholdInput = document.getElementById('late-threshold');
    const ipRestrictionCheckbox = document.getElementById('ip-restriction');
    const autoReportsCheckbox = document.getElementById('auto-reports');

    if (
      officeStartInput &&
      officeEndInput &&
      lateThresholdInput &&
      ipRestrictionCheckbox &&
      autoReportsCheckbox
    ) {
      try {
        const { getOfficeHours, getAllSettings } = await import('/src/services/settings.js');

        // Load office hours settings
        const { data: officeHours, error: officeHoursError } = await getOfficeHours();
        if (!officeHoursError && officeHours) {
          officeStartInput.value = officeHours.start || '08:00';
          officeEndInput.value = officeHours.end || '17:00';
          lateThresholdInput.value = officeHours.lateThreshold || 15;
        } else {
          // Use defaults if error or no data
          officeStartInput.value = '08:00';
          officeEndInput.value = '17:00';
          lateThresholdInput.value = 15;
        }

        // Load all settings for checkboxes
        const { data: allSettings, error: allSettingsError } = await getAllSettings();
        if (!allSettingsError && allSettings) {
          ipRestrictionCheckbox.checked = allSettings.ip_restriction === 'true' || false;
          autoReportsCheckbox.checked = allSettings.auto_generate_reports === 'true' || false;
        } else {
          // Use defaults if error or no data
          ipRestrictionCheckbox.checked = false;
          autoReportsCheckbox.checked = true;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading settings:', error);
        // Set defaults on error
        if (officeStartInput) officeStartInput.value = '08:00';
        if (officeEndInput) officeEndInput.value = '17:00';
        if (lateThresholdInput) lateThresholdInput.value = 15;
        if (ipRestrictionCheckbox) ipRestrictionCheckbox.checked = false;
        if (autoReportsCheckbox) autoReportsCheckbox.checked = true;
      }
    } else {
      // Elements not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Settings page elements not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}
