// pages/proposals.js
// Proposals listing page showing all user proposals with status and actions
// Updated to work with Supabase authentication

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { 
  DocumentTextIcon,
  PencilSquareIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

export default function ProposalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load proposals when component mounts
  useEffect(() => {
    if (user) {
      loadProposals();
    }
  }, [user]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session available');
        return;
      }

      const response = await fetch('/api/proposals', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return {
          className: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
          text: 'Submitted'
        };
      case 'draft':
      default:
        return {
          className: 'bg-yellow-100 text-yellow-800',
          icon: ClockIcon,
          text: 'Draft'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton h-6 w-3/4 mb-2"></div>
                <div className="skeleton h-4 w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="skeleton h-8 w-20"></div>
                  <div className="skeleton h-8 w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
        <p className="mt-2 text-gray-600">
          Manage your tender proposals and track their status
        </p>
      </div>

      {/* Proposals List */}
      {proposals.length > 0 ? (
        <div className="space-y-6">
          {proposals.map((proposal) => {
            const statusBadge = getStatusBadge(proposal.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={proposal.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.tenderTitle}
                      </h3>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Created: {formatDate(proposal.createdAt)}</p>
                      <p>Last updated: {formatDate(proposal.updatedAt)}</p>
                      <p>Version: {proposal.version}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusBadge.text}
                    </span>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      {proposal.status === 'draft' ? (
                        <Link href={`/proposals/edit/${proposal.id}`}>
                          <button className="btn btn-primary text-sm">
                            <PencilSquareIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/proposals/edit/${proposal.id}`}>
                          <button className="btn btn-secondary text-sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
          <p className="text-gray-600 mb-6">
            Start by browsing tenders and generating your first proposal.
          </p>
          
          {/* Development Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Database Migration Complete</h4>
                <p className="text-sm text-blue-800">
                  Proposals are now stored in Supabase database and will persist across sessions.
                </p>
              </div>
            </div>
          </div>
          
          {/* How to Create Proposals */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-w-lg mx-auto text-left">
            <h4 className="text-sm font-medium text-gray-900 mb-3">How to create a proposal:</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Browse available tenders in the Tenders section</li>
              <li>Click on a tender that interests you</li>
              <li>Review the tender details and requirements</li>
              <li>Click "Generate Proposal" to create an AI-powered draft</li>
              <li>Edit and customize your proposal</li>
              <li>Submit when ready</li>
            </ol>
          </div>
          
          <Link href="/tenders">
            <button className="btn btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Browse Tenders
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}