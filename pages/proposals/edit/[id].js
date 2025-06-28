// pages/proposals/edit/[id].js
// Enhanced proposal editor page with better error handling and workflow guidance
// Handles missing proposals gracefully and provides clear user guidance

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import EditorContainer from '../../../components/ProposalEditor/EditorContainer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ProposalEditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = router.query;
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load proposal data
  useEffect(() => {
    if (id && user) {
      loadProposal();
    } else if (id && !user && !authLoading) {
      setError('authentication');
      setLoading(false);
    }
  }, [id, user, authLoading]);

  const loadProposal = async () => {
    // Validate ID format
    if (!id || isNaN(Number(id))) {
      setError('invalid_id');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api(`/api/proposals/${id}`);
      setProposal(data);
      setError(null);
    } catch (error) {
      console.error('Error loading proposal:', error);
      setError('not_found');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading proposal editor..." />
      </div>
    );
  }

  // Handle different error states
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          
          {error === 'authentication' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">Please log in to access the proposal editor.</p>
              <Link href="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </>
          )}
          
          {error === 'invalid_id' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Proposal ID</h3>
              <p className="text-gray-600 mb-4">The proposal ID in the URL is not valid.</p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="btn btn-secondary"
                >
                  Go Back
                </button>
                <Link href="/tenders" className="btn btn-primary">
                  Browse Tenders
                </Link>
              </div>
            </>
          )}
          
          {error === 'not_found' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Proposal Not Found</h3>
              <div className="text-gray-600 mb-6 space-y-2">
                <p>This proposal doesn't exist or may have been removed.</p>
                <p className="text-sm">
                  <strong>Note:</strong> In development mode, proposals are stored in memory and are reset when the server restarts.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium text-blue-900 mb-2">How to create a proposal:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Browse available tenders</li>
                  <li>Click on a tender to view details</li>
                  <li>Use the "Generate Proposal" button</li>
                  <li>Edit your proposal in the editor</li>
                </ol>
              </div>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="btn btn-secondary"
                >
                  Go Back
                </button>
                <Link href="/tenders" className="btn btn-primary">
                  Browse Tenders
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const isSubmitted = proposal.status === 'submitted';

  return (
    <div className="h-screen flex flex-col">
      {/* Page Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isSubmitted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
              aria-label={`Proposal status: ${isSubmitted ? 'Submitted' : 'Draft'}`}
            >
              {isSubmitted ? 'Submitted' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Proposal Editor</h1>
          <p className="text-sm text-gray-600 mt-1">
            {proposal.tenderTitle}
          </p>
        </div>
      </header>

      {/* Editor Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0">
        <EditorContainer
          proposalId={proposal.id}
          initialContent={proposal.content || ''}
          proposalTitle={proposal.tenderTitle}
          readOnly={isSubmitted}
        />
      </main>
    </div>
  );
}