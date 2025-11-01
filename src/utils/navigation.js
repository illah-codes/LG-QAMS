/**
 * Navigation helper utilities
 */

import { router } from './router.js';

/**
 * Navigate to a route programmatically
 * @param {string} path - Route path
 * @param {Object} options - Navigation options
 */
export function navigate(path, options = {}) {
  router.navigate(path, options);
}

/**
 * Navigate back in history
 */
export function goBack() {
  window.history.back();
}

/**
 * Navigate forward in history
 */
export function goForward() {
  window.history.forward();
}

/**
 * Get current route
 * @returns {Object|null} - Current route configuration
 */
export function getCurrentRoute() {
  return router.getCurrentRoute();
}

/**
 * Check if a path matches the current route
 * @param {string} path - Path to check
 * @returns {boolean} - True if path matches current route
 */
export function isActive(path) {
  const currentPath = window.location.pathname;
  const normalizedPath = router.normalizePath(path);
  return currentPath === normalizedPath;
}
