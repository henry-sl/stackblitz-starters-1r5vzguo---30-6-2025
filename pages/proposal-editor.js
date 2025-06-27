// pages/proposal-editor.js
// Enhanced proposal editing page with comprehensive editor functionality
// Provides rich text editing, autosave, and export capabilities

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import EditorContainer from '../components/ProposalEditor/EditorContainer';
import { api } from '../lib/api';

export default function ProposalEditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = router.query; // Proposal ID from URL
  
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
    }
  }, [id, user]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await api(`/api/proposals/${id}`);
      setProposal(data);
    } catch (error) {
      setError('Failed to load proposal');
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Show message if no proposal found
  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Proposal not found.</p>
          <button
            onClick={() => router.push('/tenders')}
            className="mt-4 btn btn-primary"
          >
            Browse Tenders
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = proposal.status === 'submitted';

  return (
    <div className="h-screen flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Proposal Editor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {proposal.tenderTitle}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isSubmitted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isSubmitted ? 'Submitted' : 'Draft'}
            </span>
            
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0">
        <EditorContainer
          proposalId={proposal.id}
          initialContent={proposal.content || ''}
          proposalTitle={proposal.tenderTitle}
          readOnly={isSubmitted}
        />
      </div>
    </div>
  );
}