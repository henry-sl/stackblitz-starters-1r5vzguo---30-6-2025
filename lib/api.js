// lib/api.js
// This file provides utility functions for making API requests to the backend
// Updated to include authentication tokens for Supabase integration

import { supabase } from './supabaseClient';

/**
 * Main API utility function for making fetch requests to the backend
 * @param {string} path - The API endpoint path
 * @param {Object} options - Fetch options including method, body, headers, etc.
 * @returns {Promise<Object>} - JSON response from the API
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, ...rest } = options;
  
  // Get the current session to include auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  // Configure the fetch request
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`
      }),
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
export const fetcher = async (url) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      'Authorization': `Bearer ${session.access_token}`
    }),
  };
  
  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }
  
  return res.json();
};