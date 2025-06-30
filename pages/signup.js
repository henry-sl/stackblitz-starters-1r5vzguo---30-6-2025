// pages/signup.js
// This page provides user registration functionality
// It uses Supabase Auth UI for signup and redirects logged-in users to the tenders page

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to tenders page if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/tenders');
    }
  }, [user, router]);

  // Get the redirect URL safely (works on both client and server)
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/tenders`;
    }
    return '/tenders';
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Tenderly and start winning more tenders
          </p>
        </div>
        
        {/* Supabase Auth UI - configured for signup view */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {typeof window !== 'undefined' && (
            <Auth
              supabaseClient={supabase}
              view="sign_up" // Show signup form instead of login
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                    },
                  },
                },
              }}
              providers={[]} // No social login providers
              redirectTo={getRedirectUrl()} // Redirect after successful signup
            />
          )}
        </div>
      </div>
    </div>
  );
}