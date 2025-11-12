/**
 * Password Toggle Utility
 * Adds password visibility toggle functionality to password input fields
 */

/**
 * Initialize password toggle for a password input field
 * @param {HTMLInputElement} passwordInput - The password input element
 * @param {HTMLElement} container - Container element (optional, defaults to input's parent)
 */
export function initPasswordToggle(passwordInput, container = null) {
  if (!passwordInput || passwordInput.type !== 'password') {
    return;
  }

  // Find or create container
  const inputContainer = container || passwordInput.parentElement;

  // Check if toggle already exists
  if (inputContainer.querySelector('.password-toggle-btn')) {
    return;
  }

  // Create wrapper if needed
  let wrapper = inputContainer;
  if (!inputContainer.classList.contains('password-input-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'password-input-wrapper';
    wrapper.style.position = 'relative';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
  }

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'password-toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
  toggleBtn.style.cssText = `
    position: absolute;
    right: var(--flowbite-space-3);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--flowbite-space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--flowbite-text-secondary);
    transition: color 0.2s;
  `;

  // SVG Eye Icon (visible password - show password is visible)
  const eyeIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.667 10C1.667 10 4.583 4.167 10 4.167C15.417 4.167 18.333 10 18.333 10C18.333 10 15.417 15.833 10 15.833C4.583 15.833 1.667 10 1.667 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // SVG Eye Slash Icon (hidden password - hide password)
  const eyeSlashIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 2.5L17.5 17.5M8.333 8.333C7.891 8.775 7.5 9.352 7.5 10C7.5 11.381 8.619 12.5 10 12.5C10.648 12.5 11.225 12.109 11.667 11.667M15.833 15.833C14.69 16.585 13.39 17.06 12 17.167C6.583 17.167 3.667 12 3.667 12C4.417 10.58 5.583 9.167 7.167 8M11.667 6.667C13.31 5.915 14.61 5.44 16 5.333C21.417 5.333 24.333 10.5 24.333 10.5C23.583 11.92 22.417 13.333 20.833 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.5 10C12.5 11.381 11.381 12.5 10 12.5M7.5 10C7.5 8.619 8.619 7.5 10 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  toggleBtn.innerHTML = eyeSlashIcon;
  wrapper.style.position = 'relative';
  wrapper.appendChild(toggleBtn);

  // Add padding to input to make room for button
  if (!passwordInput.style.paddingRight) {
    passwordInput.style.paddingRight = 'calc(var(--flowbite-space-3) * 2 + 20px)';
  }

  // Toggle function
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = eyeIcon;
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = eyeSlashIcon;
      toggleBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // Hover effect
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.color = 'var(--flowbite-text-primary)';
  });

  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.color = 'var(--flowbite-text-secondary)';
  });
}

/**
 * Initialize password toggles for all password inputs in a container
 * @param {HTMLElement} container - Container element to search for password inputs
 */
export function initPasswordToggles(container = document) {
  const passwordInputs = container.querySelectorAll('input[type="password"]');
  passwordInputs.forEach((input) => {
    initPasswordToggle(input);
  });
}
