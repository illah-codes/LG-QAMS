/**
 * Header component logic
 */

// Embedded header HTML template
const HEADER_HTML = `<header class="navbar">
  <nav class="navbar-container">
    <a href="/" data-router class="navbar-brand">LG QAMS</a>
    <ul class="navbar-menu">
      <li><a href="/" data-router class="navbar-link">Home</a></li>
    </ul>
  </nav>
</header>`;

let cachedNavigationState = null;

/**
 * Clear navigation cache
 */
export function clearNavigationCache() {
  cachedNavigationState = null;
}

/**
 * Set navigation cache to signed-out state
 * This prevents auth listener from overriding navigation update after sign-out
 */
export function setNavigationCacheToSignedOut() {
  cachedNavigationState = {
    isLoggedIn: false,
    role: null,
    userId: null,
  };
}

/**
 * Update navigation for route change (to refresh active state)
 * This is called from router.afterEach to ensure active state updates
 */
export async function updateNavigationForRouteChange() {
  // Get current route path
  const currentPath = window.location.pathname;

  // SAFEGUARD: Force public navigation on login page
  // This prevents admin/staff navigation from showing when redirected to login
  if (currentPath === '/login' || currentPath.startsWith('/login')) {
    await updateNavigation(null);
    return;
  }

  // If cache is explicitly set to signed-out state, respect it
  // This prevents navigation from rebuilding with admin state when routing back
  if (
    cachedNavigationState !== null &&
    cachedNavigationState !== undefined &&
    cachedNavigationState.isLoggedIn === false &&
    cachedNavigationState.role === null &&
    cachedNavigationState.userId === null
  ) {
    // Cache indicates signed-out state - respect it and show public navigation
    // This prevents admin navigation from appearing when routing back to check-in page
    await updateNavigation(null);
    return;
  }

  // Get current user
  let currentUser = null;
  try {
    const { getCurrentUser } = await import('/src/services/auth.js');
    const { user, error } = await getCurrentUser();
    if (!error && user && user.id) {
      currentUser = user;
    }
  } catch (e) {
    // On error, treat as public user
    currentUser = null;
  }

  // Force update navigation with current route (includes verification)
  await updateNavigation(currentUser);
}

/**
 * Initializes the header component
 * @param {HTMLElement} container - Container element where header will be inserted
 * @param {boolean} forceUpdate - Force navigation update even if cached
 */
export function initHeader(container, forceUpdate = false) {
  // If header HTML is already loaded and we're not forcing update, just update navigation
  const existingNav = container.querySelector('.navbar-menu');
  if (existingNav && !forceUpdate) {
    // Always update navigation to ensure it's current
    updateNavigationIfNeeded();
    return;
  }

  // Set header HTML directly (embedded template)
  container.innerHTML = HEADER_HTML;
  // Router handles navigation automatically via event delegation on [data-router] links

  // Update navigation based on user role
  // If cache is set to signed-out, preserve it; otherwise clear for rebuild
  if (
    !cachedNavigationState ||
    !(
      cachedNavigationState.isLoggedIn === false &&
      cachedNavigationState.role === null &&
      cachedNavigationState.userId === null
    )
  ) {
    // Clear cache to force rebuild on initial load (unless it's signed-out state)
    cachedNavigationState = null;
  }
  updateNavigationIfNeeded();
}

/**
 * Update navigation based on current user role
 * Only rebuilds if auth state has changed
 */
async function updateNavigationIfNeeded() {
  // Get current route path
  const currentPath = window.location.pathname;

  // SAFEGUARD: Force public navigation on login page
  // This prevents admin/staff navigation from showing when redirected to login
  if (currentPath === '/login' || currentPath.startsWith('/login')) {
    // Force public navigation on login page
    await updateNavigation(null);
    return;
  }

  // If cache is explicitly set to signed-out state, respect it
  // This prevents auth listener from overriding navigation after sign-out
  if (
    cachedNavigationState !== null &&
    cachedNavigationState !== undefined &&
    cachedNavigationState.isLoggedIn === false &&
    cachedNavigationState.role === null &&
    cachedNavigationState.userId === null
  ) {
    // Cache indicates signed-out state - check if user is actually signed out
    // If getCurrentUser still returns a user, it might be a timing issue
    // In that case, we'll respect the cache and keep showing public navigation
    try {
      const { getCurrentUser } = await import('/src/services/auth.js');
      const { user, error } = await getCurrentUser();
      // If we can't get user or user is null, respect the cache
      if (error || !user || !user.id) {
        // User is actually signed out, keep public navigation
        await updateNavigation(null);
        return;
      }
      // If user exists but cache says signed out, there's a race condition
      // For login page, always show public navigation regardless
      if (currentPath === '/login' || currentPath.startsWith('/login')) {
        await updateNavigation(null);
        return;
      }
      // For other pages, respect the cache to prevent override
      // eslint-disable-next-line no-console
      console.log(
        'Cache indicates signed-out but user still exists - respecting cache to prevent override'
      );
      await updateNavigation(null);
      return;
    } catch (e) {
      // On error, respect the cache and show public navigation
      await updateNavigation(null);
      return;
    }
  }

  // Get current user from Supabase
  let currentUser = null;

  try {
    const { getCurrentUser } = await import('/src/services/auth.js');
    const { user, error } = await getCurrentUser();
    // Only set currentUser if we have a valid user with no errors
    if (!error && user && user.id) {
      currentUser = user;
    } else {
      // Explicitly set to null for public users
      currentUser = null;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error getting current user:', e);
    // On error, treat as public user
    currentUser = null;
  }

  const newState = {
    isLoggedIn: !!currentUser,
    role: currentUser?.role || null,
    userId: currentUser?.id || null,
  };

  // If state hasn't changed, skip rebuild (but always rebuild if cache is null/undefined)
  if (
    cachedNavigationState !== null &&
    cachedNavigationState !== undefined &&
    cachedNavigationState.isLoggedIn === newState.isLoggedIn &&
    cachedNavigationState.role === newState.role &&
    cachedNavigationState.userId === newState.userId
  ) {
    return; // No changes, keep existing navigation
  }

  // Update cached state
  cachedNavigationState = newState;

  // Rebuild navigation
  await updateNavigation(currentUser);
}

/**
 * Rebuild navigation menu
 * @param {Object|null} currentUser - Current user object or null
 */
export async function updateNavigation(currentUser) {
  const navMenu = document.querySelector('.navbar-menu');
  if (!navMenu) {
    // If nav menu doesn't exist yet, try again after a short delay
    setTimeout(() => updateNavigation(currentUser), 50);
    return;
  }

  // Get current route path
  const currentPath = window.location.pathname;

  // SAFEGUARD: Force public navigation on login page
  // This prevents admin/staff navigation from showing when redirected to login
  if (currentPath === '/login' || currentPath.startsWith('/login')) {
    currentUser = null; // Force public navigation on login page
  }

  // SAFEGUARD: Verify user is actually authenticated before showing role-based navigation
  // This prevents showing admin/staff navigation when user is not actually signed in
  if (currentUser) {
    try {
      const { getCurrentUser } = await import('/src/services/auth.js');
      const { user: verifiedUser, error } = await getCurrentUser();

      // If verification fails or user doesn't exist, treat as public user
      if (error || !verifiedUser || !verifiedUser.id) {
        // eslint-disable-next-line no-console
        console.log('User verification failed, showing public navigation');
        currentUser = null;
      } else {
        // User is verified, use verified user data (may have updated role)
        currentUser = verifiedUser;
      }
    } catch (e) {
      // On error, treat as public user
      // eslint-disable-next-line no-console
      console.log('Error verifying user, showing public navigation:', e);
      currentUser = null;
    }
  }

  // Clear all existing menu items
  navMenu.innerHTML = '';

  if (currentUser) {
    // User is logged in - show role-based menu (NO Home button)
    if (currentUser.role === 'Admin') {
      // Admin menu
      const adminMenuItems = [
        { href: '/admin/dashboard', text: 'Dashboard' },
        { href: '/admin/staff', text: 'Staff' },
        { href: '/admin/attendance', text: 'Attendance' },
        { href: '/admin/reports', text: 'Reports' },
        { href: '/admin/settings', text: 'Settings' },
      ];

      adminMenuItems.forEach((item) => {
        const li = document.createElement('li');
        const isActive = currentPath === item.href;
        const activeClass = isActive ? ' active' : '';
        li.innerHTML = `<a href="${item.href}" data-router class="navbar-link${activeClass}">${item.text}</a>`;
        navMenu.appendChild(li);
      });
    } else {
      // Staff menu
      const staffMenuItems = [
        { href: '/staff/dashboard', text: 'Dashboard' },
        { href: '/staff/attendance', text: 'Attendance' },
        { href: '/staff/reports', text: 'Reports' },
        { href: '/staff/profile', text: 'Profile' },
      ];

      staffMenuItems.forEach((item) => {
        const li = document.createElement('li');
        const isActive = currentPath === item.href;
        const activeClass = isActive ? ' active' : '';
        li.innerHTML = `<a href="${item.href}" data-router class="navbar-link${activeClass}">${item.text}</a>`;
        navMenu.appendChild(li);
      });
    }

    // Add user dropdown with logout
    const userLi = document.createElement('li');
    userLi.className = 'ml-auto';
    userLi.innerHTML = `
      <div class="flex flex-center flex-gap-4">
        <span class="text-secondary text-sm">${currentUser.name}</span>
        <button onclick="handleLogout()" class="btn btn-sm btn-outline text-sm">Logout</button>
      </div>
    `;
    navMenu.appendChild(userLi);
  } else {
    // Not logged in - show public menu with Home button
    const publicMenuItems = [
      { href: '/', text: 'Home' },
      { href: '/scan', text: 'Scan QR' },
      { href: '/login', text: 'Login' },
    ];

    publicMenuItems.forEach((item) => {
      const li = document.createElement('li');
      // For home page, check if path is exactly '/' or '/home'
      const isActive =
        (item.href === '/' && (currentPath === '/' || currentPath === '/home')) ||
        (item.href !== '/' && currentPath === item.href);
      const activeClass = isActive ? ' active' : '';
      li.innerHTML = `<a href="${item.href}" data-router class="navbar-link${activeClass}">${item.text}</a>`;
      navMenu.appendChild(li);
    });
  }
}

/**
 * Handle logout
 */
window.handleLogout = async function () {
  try {
    const { signOut } = await import('/src/services/auth.js');
    await signOut();
    localStorage.removeItem('currentUser');

    clearNavigationCache();
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      initHeader(headerContainer, true);
    }

    // Navigate to home
    import('/src/utils/navigation.js').then(({ navigate }) => {
      navigate('/');
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout error:', error);
  }
};
