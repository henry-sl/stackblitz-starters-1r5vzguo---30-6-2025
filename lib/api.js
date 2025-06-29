// lib/api.js
// This file provides utility functions for making API requests to the backend
// Updated to include authentication tokens for Supabase integration and enhanced error handling
// Made resilient to network errors where response body cannot be read

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
      let errorMessage = `HTTP ${res.status}`;
      
      try {
        // Try to read the error response body
        const errorText = await res.text();
        console.error(`[API] Error response:`, errorText);
        
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
      } catch (responseReadError) {
        // If we can't read the response body (e.g., due to network issues)
        console.error(`[API] Failed to read error response:`, responseReadError);
        
        // Provide a more user-friendly error message based on the response status
        if (res.status >= 500) {
          errorMessage = 'Server error: The server is experiencing issues. Please try again later.';
        } else if (res.status === 404) {
          errorMessage = 'Resource not found: The requested item could not be found.';
        } else if (res.status === 403) {
          errorMessage = 'Access denied: You do not have permission to perform this action.';
        } else if (res.status === 401) {
          errorMessage = 'Authentication required: Please log in and try again.';
        } else if (res.status >= 400) {
          errorMessage = 'Request error: There was a problem with your request.';
        } else {
          errorMessage = `Network error: Unable to process server response (HTTP ${res.status}).`;
        }
        
        // Include the original error for debugging
        if (responseReadError.message) {
          errorMessage += ` (${responseReadError.message})`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse and return the JSON response
    try {
      const data = await res.json();
      console.log(`[API] Response data:`, data);
      return data;
    } catch (jsonParseError) {
      // If we can't parse the response as JSON
      console.error(`[API] Failed to parse response as JSON:`, jsonParseError);
      throw new Error('Invalid server response: Expected JSON but received invalid data.');
    }
  } catch (error) {
    // Handle network-level errors (e.g., fetch failed, connection refused)
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      console.error(`[API] Network error:`, error);
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
    } else if (error.name === 'AbortError') {
      console.error(`[API] Request aborted:`, error);
      throw new Error('Request timeout: The request took too long to complete. Please try again.');
    } else if (error.message.startsWith('HTTP ') || 
               error.message.startsWith('Server error:') || 
               error.message.startsWith('Resource not found:') ||
               error.message.startsWith('Access denied:') ||
               error.message.startsWith('Authentication required:') ||
               error.message.startsWith('Request error:') ||
               error.message.startsWith('Network error:') ||
               error.message.startsWith('Invalid server response:')) {
      // These are our custom error messages, re-throw them as-is
      throw error;
    } else {
      // For any other unexpected errors
      console.error(`[API] Unexpected error:`, error);
      throw new Error(`Unexpected error: ${error.message || 'An unknown error occurred.'}`);
    }
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
      let errorMessage = `HTTP ${res.status}`;
      
      try {
        const errorText = await res.text();
        console.error(`[Fetcher] Error response:`, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
      } catch (responseReadError) {
        // If we can't read the response body, provide a user-friendly message
        console.error(`[Fetcher] Failed to read error response:`, responseReadError);
        
        if (res.status >= 500) {
          errorMessage = 'Server error: The server is experiencing issues.';
        } else if (res.status === 404) {
          errorMessage = 'Resource not found.';
        } else if (res.status === 403) {
          errorMessage = 'Access denied.';
        } else if (res.status === 401) {
          errorMessage = 'Authentication required.';
        } else {
          errorMessage = `Network error: Unable to process server response (HTTP ${res.status}).`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    try {
      const data = await res.json();
      console.log(`[Fetcher] Response data:`, data);
      return data;
    } catch (jsonParseError) {
      console.error(`[Fetcher] Failed to parse response as JSON:`, jsonParseError);
      throw new Error('Invalid server response: Expected JSON but received invalid data.');
    }
  } catch (error) {
    // Handle network-level errors
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      console.error(`[Fetcher] Network error:`, error);
      throw new Error('Network error: Unable to connect to the server.');
    } else if (error.name === 'AbortError') {
      console.error(`[Fetcher] Request aborted:`, error);
      throw new Error('Request timeout: The request took too long to complete.');
    } else if (error.message.startsWith('HTTP ') || 
               error.message.startsWith('Server error:') || 
               error.message.startsWith('Resource not found') ||
               error.message.startsWith('Access denied') ||
               error.message.startsWith('Authentication required') ||
               error.message.startsWith('Network error:') ||
               error.message.startsWith('Invalid server response:')) {
      // These are our custom error messages, re-throw them as-is
      throw error;
    } else {
      console.error(`[Fetcher] Unexpected error:`, error);
      throw new Error(`Unexpected error: ${error.message || 'An unknown error occurred.'}`);
    }
  }
};