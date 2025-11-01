/**
 * Router utility for handling client-side routing
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.notFoundHandler = null;
    this.beforeRouteHandler = null;
    this.afterRouteHandler = null;
  }

  /**
   * Register a route
   * @param {string} path - Route path
   * @param {Object} config - Route configuration
   * @param {string|Function} config.page - Page HTML file path or render function
   * @param {string} config.title - Page title
   * @param {Function} config.beforeEnter - Before navigation hook
   * @param {Function} config.afterEnter - After navigation hook
   */
  addRoute(path, config) {
    this.routes.set(path, {
      path,
      page: config.page,
      title: config.title || 'LG QAMS',
      beforeEnter: config.beforeEnter,
      afterEnter: config.afterEnter,
      meta: config.meta || {},
    });
    return this;
  }

  /**
   * Set not found handler
   * @param {Function|string} handler - Handler function or page path
   */
  setNotFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Set global before route handler
   * @param {Function} handler - Handler function
   */
  beforeEach(handler) {
    this.beforeRouteHandler = handler;
    return this;
  }

  /**
   * Set global after route handler
   * @param {Function} handler - Handler function
   */
  afterEach(handler) {
    this.afterRouteHandler = handler;
    return this;
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {Object} options - Navigation options
   * @param {boolean} options.replace - Replace current history entry
   */
  async navigate(path, options = {}) {
    // Normalize path
    const normalizedPath = this._normalizePathInternal(path);

    // Find route (exact match first, then try to match with params)
    const route = this.routes.get(normalizedPath);
    let routeConfig = route;

    // If exact match not found, try to find matching route with params
    if (!routeConfig) {
      routeConfig = this.matchRoute(normalizedPath);
    }

    // Handle not found
    if (!routeConfig) {
      await this.handleNotFound(normalizedPath);
      return;
    }

    // Get the actual route config (could be from Map or matched route)
    const actualRoute = route || routeConfig;

    try {
      // Call before hooks
      if (this.beforeRouteHandler) {
        const shouldProceed = await this.beforeRouteHandler(actualRoute, this.currentRoute);
        if (shouldProceed === false) {
          return;
        }
      }

      if (actualRoute.beforeEnter) {
        const shouldProceed = await actualRoute.beforeEnter(actualRoute, this.currentRoute);
        if (shouldProceed === false) {
          return;
        }
      }

      // Update current route
      const previousRoute = this.currentRoute;
      this.currentRoute = actualRoute;

      // Render page
      await this.renderRoute(actualRoute, normalizedPath);

      // Update browser URL
      if (options.replace) {
        window.history.replaceState({ path: normalizedPath }, '', normalizedPath);
      } else {
        window.history.pushState({ path: normalizedPath }, '', normalizedPath);
      }

      // Update document title
      document.title = actualRoute.title;

      // Call after hooks
      if (actualRoute.afterEnter) {
        await actualRoute.afterEnter(actualRoute, previousRoute);
      }

      if (this.afterRouteHandler) {
        await this.afterRouteHandler(actualRoute, previousRoute);
      }

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Navigation error:', error);
      await this.handleNotFound(normalizedPath);
    }
  }

  /**
   * Render a route
   * @param {Object} route - Route configuration
   * @param {string} path - Current path
   */
  async renderRoute(route, path) {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }

    // If page is a function, call it
    if (typeof route.page === 'function') {
      const content = await route.page(path);
      if (typeof content === 'string') {
        app.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        app.innerHTML = '';
        app.appendChild(content);
      }
      return;
    }

    // Otherwise, fetch and load the HTML file
    if (typeof route.page === 'string') {
      try {
        const response = await fetch(route.page);
        if (!response.ok) {
          throw new Error(`Failed to load page: ${response.statusText}`);
        }
        const html = await response.text();

        // Parse and extract content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Try to get content from #app div first, otherwise get body content
        const appDiv = doc.querySelector('#app');
        const content = appDiv ? appDiv.innerHTML : doc.body.innerHTML;

        app.innerHTML = content;

        // Execute any scripts in the loaded HTML
        const scripts = doc.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          document.body.appendChild(newScript);
        });
      } catch (error) {
        console.error('Error loading page:', error);
        throw error;
      }
    }
  }

  /**
   * Match route with parameters (simple implementation)
   * @param {string} path - Path to match
   * @returns {Object|null} - Matched route or null
   */
  matchRoute(path) {
    for (const [routePath, routeConfig] of this.routes.entries()) {
      // Simple wildcard matching
      if (routePath.includes('*')) {
        const pattern = routePath.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(path)) {
          return routeConfig;
        }
      }
    }
    return null;
  }

  /**
   * Handle 404
   * @param {string} path - Path that was not found
   */
  async handleNotFound(path) {
    const app = document.getElementById('app');
    if (!app) return;

    if (typeof this.notFoundHandler === 'function') {
      const content = await this.notFoundHandler(path);
      app.innerHTML = content;
    } else if (typeof this.notFoundHandler === 'string') {
      await this.renderRoute({ page: this.notFoundHandler, title: '404 - Not Found' }, path);
    } else {
      app.innerHTML = `
        <div class="text-center p-6">
          <h1 class="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p class="text-secondary mb-6">The page "${path}" could not be found.</p>
          <a href="/" data-router class="btn btn-primary">Go Home</a>
        </div>
      `;
    }
    document.title = '404 - Not Found';
  }

  /**
   * Initialize router
   */
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || window.location.pathname;
      this.navigate(path, { replace: false });
    });

    // Handle link clicks
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-router]');
      if (link) {
        event.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          this.navigate(href);
        }
      }
    });

    // Handle initial route
    const initialPath = this._normalizePathInternal(window.location.pathname);
    this.navigate(initialPath, { replace: true });
  }

  /**
   * Get current route
   * @returns {Object|null} - Current route configuration
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Normalize a path (public method)
   * @param {string} path - Path to normalize
   * @returns {string} - Normalized path
   */
  normalizePath(path) {
    return this._normalizePathInternal(path);
  }

  /**
   * Internal normalize path method
   * @private
   */
  _normalizePathInternal(path) {
    // Handle both relative and absolute paths
    let normalized;
    try {
      // Try to parse as URL
      const url = new URL(path, window.location.origin);
      normalized = url.pathname;
    } catch {
      // If parsing fails, treat as pathname directly
      normalized = path.split('?')[0].split('#')[0];
    }

    // Ensure leading slash
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    // Remove trailing slash (except root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }
}

// Export singleton instance
export const router = new Router();
