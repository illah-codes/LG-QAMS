/**
 * Auth Guard - Route protection middleware
 */

import { getCurrentUser, isAuthenticated } from '../services/auth.js';

/**
 * Check if route requires authentication
 * @param {string} path - Route path
 * @returns {boolean}
 */
function requiresAuth(path) {
  const publicRoutes = ['/', '/scan', '/checkin', '/login', '/scan/success', '/about'];
  return !publicRoutes.includes(path) && !path.startsWith('/scan/');
}

/**
 * Check if route requires admin role
 * @param {string} path - Route path
 * @returns {boolean}
 */
function requiresAdmin(path) {
  return path.startsWith('/admin');
}

/**
 * Auth guard middleware for router
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @returns {Promise<boolean>} - true to allow navigation, false to block
 */
export async function authGuard(to) {
  const path = to.path || to;

  // Public routes don't need authentication
  if (!requiresAuth(path)) {
    return true;
  }

  // Check authentication
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    // Redirect to login
    import('../utils/navigation.js').then(({ navigate }) => {
      navigate('/login?redirect=' + encodeURIComponent(path));
    });
    return false;
  }

  // Check admin requirement
  if (requiresAdmin(path)) {
    const { user } = await getCurrentUser();

    if (!user || user.role !== 'Admin') {
      // Redirect to staff dashboard if not admin
      import('../utils/navigation.js').then(({ navigate }) => {
        navigate('/staff/dashboard');
      });
      return false;
    }
  }

  return true;
}
