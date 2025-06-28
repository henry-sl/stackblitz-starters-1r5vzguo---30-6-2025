// lib/api.js
// This file provides utility functions for making API requests to the backend
// Updated to include authentication tokens for Supabase integration and enhanced error handling

import { supabase } from './supabaseClient';

/**
 * Main API utility function for making fetch requests to the backend
 * @param {string} path - The API endpoint path
 * @param {Object} options - Fetch options including method, body, headers, etc.
 * @returns {Promise<Object>} - JSON response from the API
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, ...rest } = options;
  
  console.log(`[API] Making ${method} request to ${path}`);
  
  // Get the current session to include auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.error('[API] No access token available');
    throw new Error('Authentication required');
  }
  
  // Configure the fetch request
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...rest.headers,
    },
    ...rest,
  };

  // Add request body if provided
  if (body) {
    config.body = JSON.stringify(body);
    console.log(`[API] Request body:`, body);
  }

  try {
    // Make the API request
    const res = await fetch(path, config);
    
    console.log(`[API] Response status: ${res.status}`);
    
    // Handle errors
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Error response:`, errorText);
      
      let errorMessage = `HTTP ${res.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
        
        // Include additional details if available
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (parseError) {
        // If we can't parse the error as JSON, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse and return the JSON response
    const data = await res.json();
    console.log(`[API] Response data:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    throw error;
  }
}

// Simple fetcher function for use with SWR data fetching library
export const fetcher = async (url) => {
  console.log(`[Fetcher] Fetching ${url}`);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.error('[Fetcher] No access token available');
    throw new Error('Authentication required');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
  
  try {
    const res = await fetch(url, { headers });
    
    console.log(`[Fetcher] Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Fetcher] Error response:`, errorText);
      
      let errorMessage = `HTTP ${res.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    console.log(`[Fetcher] Response data:`, data);
    return data;
  } catch (error) {
    console.error(`[Fetcher] Request failed:`, error);
    throw error;
  }
};