/**
 * Button component logic
 */

/**
 * Creates a button element with specified options
 * @param {Object} options - Button configuration
 * @param {string} options.text - Button text
 * @param {string} options.variant - Button variant (primary, secondary, success, danger, outline)
 * @param {string} options.size - Button size (small, medium, large)
 * @param {Function} options.onClick - Click handler function
 * @param {boolean} options.disabled - Whether button is disabled
 * @returns {HTMLButtonElement}
 */
export function createButton({
  text = 'Button',
  variant = 'primary',
  size = 'medium',
  onClick = null,
  disabled = false,
}) {
  const button = document.createElement('button');
  button.className = `btn btn--${variant}`;
  button.textContent = text;
  button.disabled = disabled;
  
  if (size !== 'medium') {
    button.classList.add(`btn--${size}`);
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

/**
 * Initializes buttons within a container
 * @param {HTMLElement} container - Container element
 */
export function initButtons(container) {
  const buttons = container.querySelectorAll('.btn');
  buttons.forEach(button => {
    // Add any common button initialization logic here
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', button.disabled ? '-1' : '0');
  });
}

