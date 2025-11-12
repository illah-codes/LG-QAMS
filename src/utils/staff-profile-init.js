/**
 * Staff Profile Page Initialization Utility
 * Handles loading and displaying staff profile information
 */

import { getCurrentUser } from '../services/auth.js';
import { initPasswordToggles } from './password-toggle.js';

/**
 * Initialize staff profile page
 * Loads and displays profile data
 */
export async function initStaffProfilePage() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileStaffId = document.getElementById('profile-staff-id');
    const profileDepartment = document.getElementById('profile-department');

    if (profileName && profileEmail && profileStaffId && profileDepartment) {
      try {
        // Load user profile data
        const { user, error } = await getCurrentUser();
        if (error || !user) {
          // eslint-disable-next-line no-console
          console.error('Failed to get user:', error);
          return;
        }

        // Populate form fields with user data
        profileName.value = user.name || '';
        profileEmail.value = user.email || '';
        profileStaffId.value = user.staff_id || '';
        profileDepartment.value = user.department || '';

        // Store current user globally for form handlers
        window.currentUser = user;

        // Initialize password toggles
        const app = document.getElementById('app');
        if (app) {
          initPasswordToggles(app);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing staff profile page:', error);
      }
    } else {
      // Elements not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Profile form elements not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}
