/**
 * Main application initialization
 */
import router from '../routes.js';
import {
  initHeader,
  clearNavigationCache,
  setNavigationCacheToSignedOut,
} from '../components/header/header.js';
import { initializeFlowbite } from './flowbite-init.js';
import { onAuthStateChange } from '../services/auth.js';

export function initializeApp() {
  // Initialize Flowbite JavaScript components
  initializeFlowbite();

  // Initialize Supabase auth state listener
  onAuthStateChange((event) => {
    // Handle auth state changes silently (no console logging needed)

    // Handle auth events
    if (event === 'SIGNED_OUT') {
      // Clear any local state if needed
      localStorage.removeItem('currentUser');
      // Set cache to signed-out state instead of clearing
      // This prevents navigation from being overridden
      setNavigationCacheToSignedOut();
      // Update navigation to show public navigation
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        initHeader(headerContainer, true); // Force update on auth change
      }
    } else {
      // For other events (SIGNED_IN, TOKEN_REFRESHED, etc.), clear cache and update
      clearNavigationCache(); // Clear cache on auth state change
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        initHeader(headerContainer, true); // Force update on auth change
      }
    }
  });

  // Initialize header component (persistent across routes)
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    initHeader(headerContainer, false); // Initial load
  }

  // Initialize router (this will handle initial route and navigation)
  router.init();
}
