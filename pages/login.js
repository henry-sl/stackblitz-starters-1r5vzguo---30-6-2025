// pages/login.js
// This page provides user authentication functionality
// It uses Supabase Auth UI for login and redirects logged-in users to the tenders page

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to tenders page if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/tenders');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Tenderly
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your AI-powered tender assistant
          </p>
        </div>
        
        {/* Supabase Auth UI */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Auth
            supabaseClient={supabase}
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
            redirectTo={`${window.location.origin}/tenders`} // Redirect after successful login
          />
        </div>
      </div>
    </div>
  );
}