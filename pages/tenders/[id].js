// /pages/tenders/[id].js
// Updated tender details page with AI Assistant replacing Key Information section
// Converted from React Router to Next.js routing

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher, api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import AIAssistant from '../../components/AIAssistant';
import { useToast } from '../../hooks/useToast';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Play,
  Download,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function TenderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();
  
  const [aiSummary, setAiSummary] = useState(null);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  const { data: tender, error, isLoading } = useSWR(
    id ? `/api/tenders/${id}` : null,
    fetcher
  );

  const generateAISummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const result = await api('/api/summarize', {
        method: 'POST',
        body: { tenderId: id }
      });
      setAiSummary(result.summary);
      addToast('Summary generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate summary', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const checkEligibility = async () => {
    try {
      setIsCheckingEligibility(true);
      const result = await api('/api/checkEligibility', {
        method: 'POST',
        body: { tenderId: id }
      });
      setEligibilityCheck(result.eligibility);
      addToast('Eligibility check completed!', 'success');
    } catch (error) {
      addToast('Failed to check eligibility', 'error');
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const generateProposal = async () => {
    try {
      setIsGeneratingProposal(true);
      const result = await api('/api/generateProposal', {
        method: 'POST',
        body: { tenderId: id }
      });
      addToast('Proposal draft created!', 'success');
      router.push(`/proposals/edit/${result.proposalId}`);
    } catch (error) {
      addToast('Failed to generate proposal', 'error');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const getDaysUntilClosing = (closingDate) => {
    return formatDistanceToNow(new Date(closingDate), { addSuffix: true });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>;
      case 'closing-soon':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closing Soon</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load tender details. Please try again.</p>
        </div>
      </div>
    );
  }

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

  const daysUntilClosing = Math.ceil(
    (new Date(tender.closingDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/tenders" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tenders</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                    {tender.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{tender.agency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Malaysia</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{tender.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{tender.category}</Badge>
                    {tender.isNew && <Badge variant="outline">Featured</Badge>}
                  </div>
                </div>
                {getStatusBadge(tender.isNew ? 'new' : 'active')}
              </div>
            </CardHeader>
          </Card>

          {/* ... rest of the file unchanged */}
