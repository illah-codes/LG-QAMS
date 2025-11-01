/**
 * API utilities for making HTTP requests
 */

/**
 * Makes a fetch request with error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

/**
 * Makes a GET request
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function get(url, options = {}) {
  const response = await request(url, { ...options, method: 'GET' });
  return response.json();
}

/**
 * Makes a POST request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function post(url, data, options = {}) {
  const response = await request(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Makes a PUT request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function put(url, data, options = {}) {
  const response = await request(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Makes a DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function del(url, options = {}) {
  const response = await request(url, { ...options, method: 'DELETE' });
  return response.json();
}

