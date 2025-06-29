// pages/proposals/edit/[id].js
// Enhanced proposal editor page with database integration for versioning and quick insert

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../lib/api';
import useSWR from 'swr';
import { fetcher } from '../../../lib/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AutosaveIndicator from '../../../components/ProposalEditor/AutosaveIndicator';
import ToolbarSection from '../../../components/ProposalEditor/ToolbarSection';
import ContentArea from '../../../components/ProposalEditor/ContentArea';
import ExportControls from '../../../components/ProposalEditor/ExportControls';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Sparkles, History, Building2, Clock, Shield, AlertCircle, CheckCircle, Send, ExternalLink, FileText, Award, TrendingUp, Trophy, Clock as Blocks, Plus, RefreshCw, Maximize, Minimize } from 'lucide-react';
import { format } from 'date-fns';

export default function ProposalEditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const { id } = router.query;
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);

  // Editor state
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGeneratingImprovement, setIsGeneratingImprovement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // Load company profile for quick insert
  useEffect(() => {
    if (user) {
      loadCompanyProfile();
    }
  }, [user]);

  // Fetch tender details using proposal's tenderId
  const { data: tender } = useSWR(
    proposal?.tenderId ? `/api/tenders/${proposal.tenderId}` : null,
    fetcher
  );

  // Fetch version history
  const { data: versions, mutate: mutateVersions } = useSWR(
    id ? `/api/versions/${id}` : null,
    fetcher
  );

  const loadProposal = async () => {
    // Updated validation: Only check if ID exists, not if it's a valid number
    // This allows UUID strings to pass validation
    if (!id) {
      setError('invalid_id');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api(`/api/proposals/${id}`);
      setProposal(data);
      setContent(data.content || '');
      setError(null);
    } catch (error) {
      console.error('Error loading proposal:', error);
      setError('not_found');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const profile = await api('/api/company');
      setCompanyProfile(profile);
    } catch (error) {
      console.error('Error loading company profile:', error);
      // Don't show error for missing profile, just log it
    }
  };

  // Create a new proposal for the first available tender
  const handleCreateProposal = async () => {
    try {
      setIsCreatingProposal(true);
      
      // Get the first available tender
      const tenders = await api('/api/tenders');
      if (!tenders || tenders.length === 0) {
        addToast('No tenders available to create a proposal for', 'error');
        return;
      }

      const firstTender = tenders[0];
      
      // Generate a proposal for the first tender
      const result = await api('/api/generateProposal', {
        method: 'POST',
        body: { tenderId: firstTender.id }
      });

      // Redirect to the new proposal editor
      router.push(`/proposals/edit/${result.proposalId}`);
      addToast('New proposal created successfully!', 'success');
    } catch (error) {
      console.error('Error creating proposal:', error);
      addToast('Failed to create proposal', 'error');
    } finally {
      setIsCreatingProposal(false);
    }
  };

  // Retry loading the proposal
  const handleRetryLoad = () => {
    setError(null);
    loadProposal();
  };

  // Autosave functionality
  const saveContent = useCallback(async () => {
    if (!id || !user || !hasUnsavedChanges) return;

    try {
      setSaveStatus('saving');
      
      await api('/api/saveDraft', {
        method: 'POST',
        body: { proposalId: id, content }
      });
      
      setSaveStatus('saved');
      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
      
      // Refresh version history after saving
      mutateVersions();
    } catch (error) {
      setSaveStatus('error');
      console.error('Autosave failed:', error);
    }
  }, [id, content, user, hasUnsavedChanges, mutateVersions]);

  // Autosave timer
  useEffect(() => {
    if (!hasUnsavedChanges || !user) return;

    const timer = setTimeout(() => {
      saveContent();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, saveContent, user]);

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    setSaveStatus('saving');
  };

  // Handle formatting commands
  const handleFormat = (action, value) => {
    switch (action) {
      case 'bold':
        insertFormatting('**', '**');
        break;
      case 'italic':
        insertFormatting('*', '*');
        break;
      case 'bulletList':
        insertFormatting('\n• ');
        break;
      case 'numberedList':
        insertFormatting('\n1. ');
        break;
      case 'heading':
        if (value === 'heading1') insertFormatting('# ');
        else if (value === 'heading2') insertFormatting('## ');
        else if (value === 'heading3') insertFormatting('### ');
        break;
      default:
        console.log('Format action not implemented:', action);
    }
  };

  // Insert formatting at cursor position
  const insertFormatting = (before, after = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Manual save
  const handleManualSave = () => {
    saveContent();
    addToast('Proposal saved successfully!', 'success');
  };

  // AI Improve functionality
  const handleImproveProposal = async () => {
    if (!proposal?.tenderId) {
      addToast('Unable to improve proposal - tender information missing', 'error');
      return;
    }

    try {
      setIsGeneratingImprovement(true);
      const result = await api('/api/improveProposal', {
        method: 'POST',
        body: { 
          tenderId: proposal.tenderId, 
          proposalContent: content 
        }
      });
      
      setContent(result.improvedContent);
      setHasUnsavedChanges(true);
      addToast('Proposal improved successfully!', 'success');
    } catch (error) {
      addToast('Failed to improve proposal', 'error');
    } finally {
      setIsGeneratingImprovement(false);
    }
  };

  // Submit proposal
  const handleSubmitProposal = async () => {
    try {
      setIsSubmitting(true);
      const result = await api('/api/submitProposal', {
        method: 'POST',
        body: { proposalId: id }
      });
      
      addToast(`Proposal submitted! Transaction ID: ${result.txId}`, 'success');
      router.push('/reputation');
    } catch (error) {
      addToast('Failed to submit proposal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Insert company information using database data
  const insertCompanyInfo = (section) => {
    if (!companyProfile) {
      addToast('Company profile not loaded. Please complete your profile first.', 'error');
      return;
    }

    const companyInfo = {
      background: `\n\n**Company Background:**\n${companyProfile.name} is ${companyProfile.experience || 'a professional company with extensive experience in our field'}.\n\n`,
      certifications: `\n\n**Certifications:**\n${companyProfile.certifications && companyProfile.certifications.length > 0 
        ? companyProfile.certifications.map(cert => `- ${cert}`).join('\n') 
        : '- Professional certifications available upon request'}\n\n`,
      experience: `\n\n**Company Experience:**\n${companyProfile.experience || 'Our company brings extensive experience and proven capabilities to this project.'}\n\n`
    };

    const insertion = companyInfo[section] || "";
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const newContent = content.slice(0, cursorPosition) + insertion + content.slice(cursorPosition);
      handleContentChange(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPosition + insertion.length, cursorPosition + insertion.length);
      }, 0);
    }
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      // F11 or Ctrl+Shift+F for full screen
      if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        toggleFullScreen();
      }
      // Escape to exit full screen
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
            <AlertCircle className="h-6 w-6 text-red-600" />
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
                <button onClick={() => router.back()} className="btn btn-secondary">
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
                  <strong>Note:</strong> Proposals are now stored in the Supabase database and should persist across sessions.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Solutions:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Create a new proposal</span>
                    <Button 
                      size="sm" 
                      onClick={handleCreateProposal}
                      disabled={isCreatingProposal}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreatingProposal ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Try loading again</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleRetryLoad}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium text-amber-900 mb-2">Alternative: Create from tender</h4>
                <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                  <li>Browse available tenders</li>
                  <li>Click on a tender to view details</li>
                  <li>Use the "Generate Proposal" button</li>
                  <li>Edit your proposal in the editor</li>
                </ol>
              </div>
              
              <div className="flex space-x-3 justify-center">
                <button onClick={() => router.back()} className="btn btn-secondary">
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

  const isSubmitted = proposal?.status === 'submitted';

  return (
    <div className={`${
      isFullScreen 
        ? 'fixed inset-0 z-[9999] bg-white overflow-auto p-0' 
        : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }`}>
      {/* Header - hidden in full screen */}
      {!isFullScreen && (
        <div className="mb-6">
          <Link href="/tenders" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tender Details</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proposal Editor</h1>
              <p className="text-gray-600">{proposal?.tenderTitle}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Saved {format(new Date(lastSaved), "HH:mm")}</span>
                </span>
              )}
              <Button variant="outline" onClick={handleManualSave}>
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`${
        isFullScreen 
          ? 'grid grid-cols-1 gap-0 h-full' 
          : 'grid grid-cols-1 lg:grid-cols-4 gap-8'
      }`}>
        {/* Main Editor */}
        <div className={isFullScreen ? 'col-span-1 h-full' : 'lg:col-span-3'}>
          <Card className={`${
            isFullScreen 
              ? 'h-full border-0 shadow-none rounded-none' 
              : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Proposal Content</CardTitle>
                <div className="flex items-center space-x-2">
                  <AutosaveIndicator status={saveStatus} lastSaved={lastSaved} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleImproveProposal}
                    disabled={isGeneratingImprovement || !content.trim()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGeneratingImprovement ? 'Improving...' : 'AI Improve'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    Versions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleFullScreen}
                    title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Full Screen (F11)'}
                  >
                    {isFullScreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`${
              isFullScreen ? 'flex flex-col flex-1 p-0' : 'p-0'
            }`}>
              {!isSubmitted && (
                <ToolbarSection onFormat={handleFormat} disabled={isSubmitted} />
              )}
              <ContentArea
                content={content}
                onChange={handleContentChange}
                readOnly={isSubmitted}
                placeholder="Start writing your proposal..."
                isFullScreen={isFullScreen}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - hidden in full screen */}
        {!isFullScreen && (
          <div className="space-y-6">
            {/* Quick Insert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Quick Insert</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => insertCompanyInfo('background')}
                  disabled={isSubmitted || !companyProfile}
                >
                  Company Background
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => insertCompanyInfo('certifications')}
                  disabled={isSubmitted || !companyProfile}
                >
                  Certifications
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => insertCompanyInfo('experience')}
                  disabled={isSubmitted || !companyProfile}
                >
                  Past Experience
                </Button>
                {!companyProfile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Complete your company profile to enable quick insert
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Version History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Version History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versions && versions.length > 0 ? (
                    versions.slice(0, 5).map((version) => (
                      <div key={version.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <div>
                          <p className="text-sm font-medium">Version {version.version}</p>
                          <p className="text-xs text-gray-500">{format(new Date(version.createdAt), "MMM d, HH:mm")}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No versions yet</p>
                      <p className="text-xs text-gray-400 mt-1">Versions are created when you save drafts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Proposal */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-900">
                  <Shield className="w-5 h-5" />
                  <span>Submit Proposal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-gray-700">
                      Submitting will record your proposal on the Algorand blockchain and lock further edits.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Proposal content ready</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Company profile complete</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>All requirements met</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting || isSubmitted || !content.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting to Blockchain...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tender Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Tender Reference</CardTitle>
              </CardHeader>
              <CardContent>
                {tender ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <p className="font-semibold">{tender.budget || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Closing:</span>
                      <p className="font-semibold">{tender.closingDate ? format(new Date(tender.closingDate), "MMM d, yyyy") : 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-semibold">{tender.category}</p>
                    </div>
                    <Link href={`/tenders/${tender.id}`} className="block mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Tender
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading tender details...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}