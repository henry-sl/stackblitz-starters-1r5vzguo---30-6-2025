// hooks/useToast.js
// This custom hook manages toast notifications throughout the application
// It provides functions to add and remove toast notifications

import { useState, useCallback } from 'react';

export function useToast() {
  // State to store all active toast notifications
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast notification
  // Parameters:
  // - message: The text to display in the toast
  // - type: The type of toast (info, success, error) which affects styling
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now(); // Generate unique ID based on timestamp
    const toast = { id, message, type };
    
    // Add the new toast to the list
    setToasts(prev => [...prev, toast]);
    
    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Function to manually remove a toast by its ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Return the toast state and functions
  return { toasts, addToast, removeToast };
}