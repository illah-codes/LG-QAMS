/**
 * Main application initialization
 */
import router from '../routes.js';
import { initHeader } from '../components/header/header.js';

export function initializeApp() {
  // Initialize header component (persistent across routes)
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    initHeader(headerContainer);
  }

  // Initialize router (this will handle initial route and navigation)
  router.init();
}
