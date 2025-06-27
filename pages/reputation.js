// pages/reputation.js
// This page displays the company's reputation based on blockchain attestations
// It shows a table of submitted proposals with their blockchain transaction IDs

import useSWR from 'swr';
import { fetcher } from '../lib/api';
import ReputationTable from '../components/ReputationTable';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Reputation() {
  // Fetch attestations data from the API
  const { data: attestations, error, isLoading } = useSWR('/api/attestations', fetcher);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-secondary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Reputation & Proofs</h1>
        </div>
        
        {/* Informational banner explaining blockchain verification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Blockchain Verification</h3>
              <p className="text-sm text-blue-700 mt-1">
                All proposal submissions are recorded on the Algorand Testnet blockchain, 
                providing immutable proof of your tender participation and building your reputation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load reputation data. Please try again.</p>
        </div>
      ) : isLoading ? (
        // Loading state
        <div className="card">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="skeleton h-4 w-1/4"></div>
                <div className="skeleton h-4 w-1/6"></div>
                <div className="skeleton h-4 w-1/6"></div>
                <div className="skeleton h-4 w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Render the reputation table with attestations data
        <ReputationTable attestations={attestations} />
      )}
    </div>
  );
}