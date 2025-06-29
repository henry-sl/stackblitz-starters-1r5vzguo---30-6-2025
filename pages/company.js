// pages/company.js
// Updated to use the detailed CompanyProfile component instead of the simple ProfileForm
// This will display the comprehensive tabbed interface with all profile sections

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { CompanyProfile } from '../components/CompanyProfile/CompanyProfile';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CompanyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading company profile..." />
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <CompanyProfile />;
}