/**
 * Route configuration
 */

import { router } from './utils/router.js';

// Define routes
router
  .addRoute('/', {
    page: '/src/pages/home.html',
    title: 'Home - LG QAMS',
    meta: {
      description: 'Local Government QR Code Attendance Management System',
    },
  })
  .addRoute('/about', {
    page: '/src/pages/about.html',
    title: 'About - LG QAMS',
    meta: {
      description: 'About LG QAMS',
    },
  })
  .addRoute('/home', {
    page: '/src/pages/home.html',
    title: 'Home - LG QAMS',
  })
  .setNotFound('/src/pages/404.html'); // Will create a 404 page later

// Optional: Add global navigation hooks
router.beforeEach((to, from) => {
  // You can add loading indicators, authentication checks, etc.
  console.log(`Navigating from ${from?.path || '/'} to ${to.path}`);
});

router.afterEach(async (to, from) => {
  // You can add analytics, cleanup, etc.
  console.log(`Navigation to ${to.path} complete`);

  // Re-initialize Flowbite components after route change
  const { initFlowbite } = await import('flowbite');
  setTimeout(() => {
    initFlowbite();
  }, 0);
});

export default router;
