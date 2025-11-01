/**
 * Header component logic
 */

/**
 * Initializes the header component
 * @param {HTMLElement} container - Container element where header will be inserted
 */
export function initHeader(container) {
  // Load header HTML
  fetch('/src/components/header/header.html')
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
      // Load header styles
      loadStyles('/src/components/header/header.css');
      // Router handles navigation automatically via event delegation on [data-router] links

      // Update navigation based on user role
      updateNavigation();
    })
    .catch((error) => {
      console.error('Failed to load header:', error);
    });
}

/**
 * Update navigation based on current user role
 */
function updateNavigation() {
  // Get current user from localStorage or mock
  const currentUserStr = localStorage.getItem('currentUser');
  let currentUser = null;

  if (currentUserStr) {
    try {
      currentUser = JSON.parse(currentUserStr);
    } catch (e) {
      console.error('Error parsing current user:', e);
    }
  }

  const navMenu = document.querySelector('.navbar-menu');
  if (!navMenu) return;

  // Clear existing menu items (except home)
  const homeItem = navMenu.querySelector('li:first-child');
  navMenu.innerHTML = '';
  if (homeItem) {
    navMenu.appendChild(homeItem);
  }

  if (currentUser) {
    // User is logged in - show role-based menu
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
        li.innerHTML = `<a href="${item.href}" data-router class="navbar-link">${item.text}</a>`;
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
        li.innerHTML = `<a href="${item.href}" data-router class="navbar-link">${item.text}</a>`;
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
    // Not logged in - show public menu
    const publicMenuItems = [
      { href: '/scan', text: 'Scan QR' },
      { href: '/login', text: 'Login' },
    ];

    publicMenuItems.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.href}" data-router class="navbar-link">${item.text}</a>`;
      navMenu.appendChild(li);
    });
  }
}

/**
 * Handle logout
 */
window.handleLogout = function () {
  localStorage.removeItem('currentUser');
  // Re-initialize header to update navigation
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    initHeader(headerContainer);
  }
  // Navigate to home
  import('/src/utils/navigation.js').then(({ navigate }) => {
    navigate('/');
  });
};

/**
 * Dynamically loads CSS file
 * @param {string} href - Path to CSS file
 */
function loadStyles(href) {
  // Check if stylesheet already loaded
  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
