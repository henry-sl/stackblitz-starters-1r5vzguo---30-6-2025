// contexts/AuthContext.jsx
// This file creates a React context for authentication state management
// It provides authentication state and functions to all components in the app

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Create the authentication context
const AuthContext = createContext();

// AuthProvider component that wraps the app and provides authentication state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Current authenticated user
  const [loading, setLoading] = useState(true); // Loading state during auth checks

  useEffect(() => {
    // Get initial session when component mounts
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Set up listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Clean up subscription when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Function to sign out the current user
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Provide auth state and functions to children components
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};