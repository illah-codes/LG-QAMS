/**
 * Route configuration
 */

import { router } from './utils/router.js';
import { authGuard } from './guards/auth-guard.js';

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
    afterEnter: async () => {
      // Initialize QR code after route loads
      const { initScanPageQRCode } = await import('./utils/qr-code-init.js');
      await initScanPageQRCode();
    },
  })
  .addRoute('/checkin', {
    page: '/src/pages/public/checkin.html',
    title: 'Check In / Check Out - LG QAMS',
    afterEnter: async () => {
      // Initialize password toggle after route loads
      const { initCheckinPasswordToggle } = await import('./utils/password-init.js');
      await initCheckinPasswordToggle();
    },
  })
  .addRoute('/login', {
    page: '/src/pages/public/login.html',
    title: 'Login - LG QAMS',
    afterEnter: async () => {
      // Initialize password toggle after route loads
      const { initLoginPasswordToggle } = await import('./utils/password-init.js');
      await initLoginPasswordToggle();
    },
  })
  .addRoute('/scan/success', {
    page: '/src/pages/public/scan-success.html',
    title: 'Scan Successful - LG QAMS',
    afterEnter: async () => {
      // Initialize success page after route loads
      // This ensures the page updates when navigating back with different URL parameters
      const { initSuccessPage } = await import('./utils/success-init.js');
      // Wait a bit for DOM to be ready, then initialize
      setTimeout(() => {
        initSuccessPage();
      }, 50);
    },
  });

// Staff routes
router
  .addRoute('/staff/dashboard', {
    page: '/src/pages/staff/dashboard.html',
    title: 'Dashboard - LG QAMS',
    afterEnter: async () => {
      // Initialize dashboard data after route loads
      const { initStaffDashboard } = await import('./utils/dashboard-init.js');
      await initStaffDashboard();
    },
  })
  .addRoute('/staff/attendance', {
    page: '/src/pages/staff/attendance.html',
    title: 'Attendance History - LG QAMS',
    afterEnter: async () => {
      // Initialize attendance page after route loads
      const { initStaffAttendancePage } = await import('./utils/staff-attendance-init.js');
      await initStaffAttendancePage();
    },
  })
  .addRoute('/staff/reports', {
    page: '/src/pages/staff/reports.html',
    title: 'Reports - LG QAMS',
    afterEnter: async () => {
      // Initialize reports page after route loads
      const { initStaffReportsPage } = await import('./utils/staff-reports-init.js');
      await initStaffReportsPage();
    },
  })
  .addRoute('/staff/profile', {
    page: '/src/pages/staff/profile.html',
    title: 'Profile - LG QAMS',
    afterEnter: async () => {
      // Initialize profile page (loads profile data and password toggles)
      const { initStaffProfilePage } = await import('./utils/staff-profile-init.js');
      await initStaffProfilePage();
    },
  });

// Admin routes
router
  .addRoute('/admin/dashboard', {
    page: '/src/pages/admin/dashboard.html',
    title: 'Admin Dashboard - LG QAMS',
    afterEnter: async () => {
      // Initialize dashboard data after route loads
      const { initAdminDashboard } = await import('./utils/dashboard-init.js');
      await initAdminDashboard();
    },
  })
  .addRoute('/admin/staff', {
    page: '/src/pages/admin/staff-management.html',
    title: 'Staff Management - LG QAMS',
    afterEnter: async () => {
      // Initialize staff management page after route loads
      const { initStaffManagementPage } = await import('./utils/staff-init.js');
      await initStaffManagementPage();
    },
  })
  .addRoute('/admin/attendance', {
    page: '/src/pages/admin/attendance.html',
    title: 'Attendance Records - LG QAMS',
    afterEnter: async () => {
      // Initialize attendance page after route loads
      const { initAttendancePage } = await import('./utils/attendance-init.js');
      await initAttendancePage();
    },
  })
  .addRoute('/admin/reports', {
    page: '/src/pages/admin/reports.html',
    title: 'Reports & Analytics - LG QAMS',
    afterEnter: async () => {
      // Page initialization is handled by the page script (IIFE pattern)
      // This ensures proper timing and matches the attendance page pattern
    },
  })
  .addRoute('/admin/settings', {
    page: '/src/pages/admin/settings.html',
    title: 'System Settings - LG QAMS',
    afterEnter: async () => {
      // Initialize settings page after route loads
      const { initSettingsPage } = await import('./utils/settings-init.js');
      await initSettingsPage();
    },
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
router.beforeEach(async (to, from) => {
  // You can add loading indicators, authentication checks, etc.
  // eslint-disable-next-line no-console
  console.log(`Navigating from ${from?.path || '/'} to ${to.path}`);

  // Run auth guard
  const allowed = await authGuard(to, from);
  if (!allowed) {
    return false; // Block navigation
  }
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

  const { updateNavigationForRouteChange } = await import('./components/header/header.js');
  // Force navigation update to refresh active state on route change
  updateNavigationForRouteChange();
});

export default router;
