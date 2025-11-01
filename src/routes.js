/**
 * Route configuration
 */

import { router } from './utils/router.js';

// Public routes
router
  .addRoute('/', {
    page: '/src/pages/public/home.html',
    title: 'Home - LG QAMS',
    meta: {
      description: 'Local Government QR Code Attendance Management System',
    },
  })
  .addRoute('/scan', {
    page: '/src/pages/public/scan.html',
    title: 'Scan QR Code - LG QAMS',
  })
  .addRoute('/login', {
    page: '/src/pages/public/login.html',
    title: 'Login - LG QAMS',
  })
  .addRoute('/scan/success', {
    page: '/src/pages/public/scan-success.html',
    title: 'Scan Successful - LG QAMS',
  });

// Staff routes
router
  .addRoute('/staff/dashboard', {
    page: '/src/pages/staff/dashboard.html',
    title: 'Dashboard - LG QAMS',
  })
  .addRoute('/staff/attendance', {
    page: '/src/pages/staff/attendance.html',
    title: 'Attendance History - LG QAMS',
  })
  .addRoute('/staff/reports', {
    page: '/src/pages/staff/reports.html',
    title: 'Reports - LG QAMS',
  })
  .addRoute('/staff/profile', {
    page: '/src/pages/staff/profile.html',
    title: 'Profile - LG QAMS',
  });

// Admin routes
router
  .addRoute('/admin/dashboard', {
    page: '/src/pages/admin/dashboard.html',
    title: 'Admin Dashboard - LG QAMS',
  })
  .addRoute('/admin/staff', {
    page: '/src/pages/admin/staff-management.html',
    title: 'Staff Management - LG QAMS',
  })
  .addRoute('/admin/attendance', {
    page: '/src/pages/admin/attendance.html',
    title: 'Attendance Records - LG QAMS',
  })
  .addRoute('/admin/reports', {
    page: '/src/pages/admin/reports.html',
    title: 'Reports & Analytics - LG QAMS',
  })
  .addRoute('/admin/settings', {
    page: '/src/pages/admin/settings.html',
    title: 'System Settings - LG QAMS',
  });

// Legacy routes
router
  .addRoute('/about', {
    page: '/src/pages/about.html',
    title: 'About - LG QAMS',
  })
  .addRoute('/home', {
    page: '/src/pages/public/home.html',
    title: 'Home - LG QAMS',
  })
  .setNotFound('/src/pages/404.html');

// Optional: Add global navigation hooks
router.beforeEach((to, from) => {
  // You can add loading indicators, authentication checks, etc.
  // eslint-disable-next-line no-console
  console.log(`Navigating from ${from?.path || '/'} to ${to.path}`);
});

router.afterEach(async (to) => {
  // You can add analytics, cleanup, etc.
  // eslint-disable-next-line no-console
  console.log(`Navigation to ${to.path} complete`);

  // Re-initialize Flowbite components after route change
  const { initFlowbite } = await import('flowbite');
  setTimeout(() => {
    initFlowbite();
  }, 0);

  // Update navigation header after route change
  const { initHeader } = await import('./components/header/header.js');
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    initHeader(headerContainer);
  }
});

export default router;
