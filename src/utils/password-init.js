/**
 * Password Toggle Initialization Utility
 * Handles re-initializing password toggles when routing back to pages
 */

import { initPasswordToggle, initPasswordToggles } from './password-toggle.js';

/**
 * Initialize password toggle for login page
 * Waits for DOM elements and initializes password toggle
 */
export async function initLoginPasswordToggle() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const passwordInput = document.getElementById('login-password');

    if (passwordInput) {
      try {
        // Check if toggle already exists to avoid duplicates
        const container = passwordInput.parentElement;
        if (!container.querySelector('.password-toggle-btn')) {
          initPasswordToggle(passwordInput);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing login password toggle:', error);
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Login password input not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Initialize password toggle for check-in page
 * Waits for DOM elements and initializes password toggle
 */
export async function initCheckinPasswordToggle() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const passwordInput = document.getElementById('scan-password');

    if (passwordInput) {
      try {
        // Check if toggle already exists to avoid duplicates
        const container = passwordInput.parentElement;
        if (!container.querySelector('.password-toggle-btn')) {
          initPasswordToggle(passwordInput);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing check-in password toggle:', error);
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('Check-in password input not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}

/**
 * Initialize password toggles for staff profile page
 * Waits for DOM elements and initializes all password toggles
 */
export async function initProfilePasswordToggles() {
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const app = document.getElementById('app');

    if (app) {
      try {
        // Initialize all password toggles in the app container
        initPasswordToggles(app);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing profile password toggles:', error);
      }
    } else {
      // Element not ready, retry
      retries++;
      if (retries < maxRetries) {
        setTimeout(tryInit, 50 * retries); // Exponential backoff
      } else {
        // eslint-disable-next-line no-console
        console.error('App container not found after max retries');
      }
    }
  };

  // Start initialization
  tryInit();
}
