// pages/tenders/[id].js
// Updated tender details page with translation functionality
// Added Lingo.dev integration for Malay-English translation

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher, api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TranslationButton from '../../components/Translation/TranslationButton';
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
  AlertCircle,
  Languages
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

  // Fetch tender details from the API
  const { data: tender, error, isLoading } = useSWR(
    id ? `/api/tenders/${id}` : null,
    fetcher
  );

  // AI functions
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
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/tenders" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tenders</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
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

          {/* AI Tools Panel */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Sparkles className="w-5 h-5" />
                <span>AI-Powered Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary}
                  className="flex flex-col items-center space-y-2 h-auto py-4 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-6 h-6" />
                  <span>{isGeneratingSummary ? 'Generating...' : 'AI Summary'}</span>
                </Button>
                
                <Button
                  onClick={checkEligibility}
                  disabled={isCheckingEligibility}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>{isCheckingEligibility ? 'Checking...' : 'Check Eligibility'}</span>
                </Button>
                
                <Button
                  onClick={generateProposal}
                  disabled={isGeneratingProposal}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>{isGeneratingProposal ? 'Generating...' : 'Generate Proposal'}</span>
                </Button>
              </div>

              {/* AI Summary Result */}
              {aiSummary && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Summary</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                      <TranslationButton
                        text={aiSummary}
                        targetLang="ms"
                        buttonText="Translate to Malay"
                        size="sm"
                      />
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{aiSummary}</p>
                </div>
              )}

              {/* Eligibility Check Result */}
              {eligibilityCheck && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Eligibility Assessment</span>
                  </h4>
                  <div className="space-y-2">
                    {eligibilityCheck.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                          item.eligible ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {item.eligible ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.requirement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tender Details Tabs */}
          <Card>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Project Description</h3>
                    <TranslationButton
                      text={tender.description}
                      targetLang="en"
                      buttonText="Translate to English"
                      variant="outline"
                    />
                  </div>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {tender.description}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements & Qualifications</h3>
                <div className="text-gray-700">
                  <p>Specific requirements will be detailed in the tender documentation.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Agency</label>
                    <p className="text-gray-900">{tender.agency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{tender.category}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Closing Date</label>
                <p className="font-semibold text-gray-900">{new Date(tender.closingDate).toLocaleDateString()}</p>
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getDaysUntilClosing(tender.closingDate)}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900">{tender.category}</p>
              </div>
            </CardContent>
          </Card>

          {/* Translation Tools */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <Languages className="w-5 h-5" />
                <span>Translation Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-700 mb-4">
                Translate tender content between English and Bahasa Malaysia
              </p>
              
              <TranslationButton
                text={tender.title}
                targetLang="en"
                buttonText="Translate Title to English"
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              />
              
              <TranslationButton
                text={tender.description}
                targetLang="en"
                buttonText="Translate Description to English"
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              />
              
              <div className="pt-2 border-t border-purple-200">
                <p className="text-xs text-purple-600">
                  <strong>Tip:</strong> Official submissions must be in Bahasa Malaysia. 
                  Use translation when preparing your proposal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={generateProposal}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isGeneratingProposal}
              >
                {isGeneratingProposal ? 'Generating...' : 'Start Proposal'}
              </Button>
              <Button variant="outline" className="w-full">
                Save for Later
              </Button>
              <Button variant="outline" className="w-full">
                Share Tender
              </Button>
            </CardContent>
          </Card>

          {/* Voice Summary */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <Play className="w-5 h-5" />
                <span>Voice Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 mb-4">
                Listen to an AI-generated audio summary of this tender
              </p>
              <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                <Play className="w-4 h-4 mr-2" />
                Play Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}