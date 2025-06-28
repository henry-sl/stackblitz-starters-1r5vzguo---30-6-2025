// pages/_app.js
// Main application entry point with error boundaries, providers, and Lingo.dev integration
// Implements lazy loading and accessibility features

import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { LingoProviderWrapper, loadDictionary } from "lingo.dev/react/client";
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Focus management for route changes
function useFocusManagement() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Focus main content after route change for accessibility
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
}

export default function App({ Component, pageProps }) {
  useFocusManagement();

  return (
    <ErrorBoundary>
      <LingoProviderWrapper loadDictionary={(locale) => loadDictionary(locale)}>
        <AuthProvider>
          <Layout>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </Layout>
        </AuthProvider>
      </LingoProviderWrapper>
    </ErrorBoundary>
  );
}