// pages/tenders/[id].js
// This page displays detailed information about a specific tender
// It includes AI-powered features like summarization, eligibility checking, and proposal drafting

import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetcher, api } from '../../lib/api';
import SummaryBox from '../../components/SummaryBox';
import EligibilityBox from '../../components/EligibilityBox';
import VoicePlayer from '../../components/VoicePlayer';
import { useToast } from '../../hooks/useToast';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  PencilSquareIcon,
  CalendarIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

export default function TenderDetails() {
  const router = useRouter();
  const { id } = router.query; // Get tender ID from URL
  const { addToast } = useToast();
  
  // State for AI-generated content
  const [summary, setSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);

  // Fetch tender details from the API
  const { data: tender, error, isLoading } = useSWR(
    id ? `/api/tenders/${id}` : null,
    fetcher
  );

  // Generate an AI summary of the tender
  const handleSummarize = async () => {
    try {
      setLoadingSummary(true);
      const result = await api('/api/summarize', {
        method: 'POST',
        body: { tenderId: id }
      });
      setSummary(result.summary);
      addToast('Summary generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate summary', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Check company eligibility for the tender
  const handleCheckEligibility = async () => {
    try {
      setLoadingEligibility(true);
      const result = await api('/api/checkEligibility', {
        method: 'POST',
        body: { tenderId: id }
      });
      setEligibility(result.eligibility);
      addToast('Eligibility check completed!', 'success');
    } catch (error) {
      addToast('Failed to check eligibility', 'error');
    } finally {
      setLoadingEligibility(false);
    }
  };

  // Generate an AI-drafted proposal for the tender
  const handleDraftProposal = async () => {
    try {
      setLoadingProposal(true);
      const result = await api('/api/generateProposal', {
        method: 'POST',
        body: { tenderId: id }
      });
      addToast('Proposal draft created!', 'success');
      router.push(`/proposals/${result.proposalId}`);
    } catch (error) {
      addToast('Failed to generate proposal', 'error');
    } finally {
      setLoadingProposal(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load tender details. Please try again.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !tender) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>
          <div className="skeleton h-32 w-full"></div>
        </div>
      </div>
    );
  }

  // Calculate days until closing date
  const daysUntilClosing = Math.ceil(
    (new Date(tender.closingDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        {/* Tender title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{tender.title}</h1>
        
        {/* Tender metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            <span>{tender.agency}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Closes: {new Date(tender.closingDate).toLocaleDateString()}</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {tender.category}
          </span>
          {daysUntilClosing <= 7 && daysUntilClosing > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-yellow-800">
              {daysUntilClosing} days left
            </span>
          )}
        </div>

        {/* AI Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Summarize button */}
          <button
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="btn btn-primary"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {loadingSummary ? 'Summarizing...' : 'Summarize'}
          </button>
          
          {/* Check Eligibility button */}
          <button
            onClick={handleCheckEligibility}
            disabled={loadingEligibility}
            className="btn btn-secondary"
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            {loadingEligibility ? 'Checking...' : 'Check Eligibility'}
          </button>
          
          {/* Draft Proposal button */}
          <button
            onClick={handleDraftProposal}
            disabled={loadingProposal}
            className="btn btn-primary"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            {loadingProposal ? 'Generating...' : 'Draft Proposal'}
          </button>
          
          {/* Voice Player component */}
          <VoicePlayer 
            tenderId={id} 
            onError={(error) => addToast(error, 'error')} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Tender Description */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Tender Description</h2>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {tender.description}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar - AI-generated content */}
        <div className="space-y-6">
          {summary && <SummaryBox summary={summary} loading={loadingSummary} />}
          {eligibility && <EligibilityBox eligibility={eligibility} loading={loadingEligibility} />}
        </div>
      </div>
    </div>
  );
}