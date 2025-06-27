// lib/api.js
// This file provides utility functions for making API requests to the backend

/**
 * Main API utility function for making fetch requests to the backend
 * @param {string} path - The API endpoint path
 * @param {Object} options - Fetch options including method, body, headers, etc.
 * @returns {Promise<Object>} - JSON response from the API
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, ...rest } = options;
  
  // Configure the fetch request
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...rest,
  };

  // Add request body if provided
  if (body) {
    config.body = JSON.stringify(body);
  }

  // Make the API request
  const res = await fetch(path, config);
  
  // Handle errors
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }
  
  // Parse and return the JSON response
  return res.json();
}

// Simple fetcher function for use with SWR data fetching library
export const fetcher = (url) => api(url);