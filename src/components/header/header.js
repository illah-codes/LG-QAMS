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
    })
    .catch((error) => {
      console.error('Failed to load header:', error);
    });
}

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
