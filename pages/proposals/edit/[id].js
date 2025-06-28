import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from 'swr';
import { fetcher, api } from '../../../lib/api';
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  History, 
  Sparkles, 
  Building2, 
  Clock,
  Shield,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from '../../../hooks/useToast';

// Mock proposal template
const mockProposalTemplate = `# Proposal for Road Maintenance and Repair Services - Kuala Lumpur District

## Executive Summary

We are pleased to submit our proposal for the comprehensive road maintenance and repair services across the Kuala Lumpur district. With over 8 years of experience in road construction and maintenance, our company is well-positioned to deliver high-quality services that meet DBKL's requirements and exceed expectations.

## Company Background

[Your Company Name] is a CIDB Grade G5 certified contractor specializing in road construction, maintenance, and infrastructure development. Since our establishment in 2016, we have successfully completed over 50 road maintenance projects across Malaysia, with a combined value exceeding RM 15 million.

### Key Qualifications:
- CIDB Grade G5 certification (exceeds G4 requirement)
- 8+ years of road construction and maintenance experience
- Valid contractor license (expires 2026)
- ISO 9001:2015 Quality Management certification
- 3 certified site supervisors on staff

## Technical Approach

### 1. Pothole Repairs and Road Resurfacing
Our approach to pothole repairs follows JKR specifications and includes:
- Comprehensive road condition assessment
- Proper excavation and cleaning of damaged areas
- Application of tack coat and hot mix asphalt
- Compaction using appropriate equipment
- Quality control testing

### 2. Drainage System Improvements
We will implement a systematic approach to drainage maintenance:
- Survey and assessment of existing drainage systems
- Clearing of blocked drains and culverts
- Repair and replacement of damaged components
- Installation of new drainage where required

### 3. Road Marking and Signage
Our road marking services include:
- Thermoplastic road marking application
- Reflective signage installation
- Traffic management during works
- Compliance with Malaysian road marking standards

## Project Timeline

We propose a 24-month project timeline with the following phases:
- Phase 1 (Months 1-6): Major arterial roads
- Phase 2 (Months 7-12): Secondary roads
- Phase 3 (Months 13-18): Residential areas
- Phase 4 (Months 19-24): Final inspections and warranty period

## Quality Assurance

Our quality assurance program includes:
- Daily progress monitoring
- Material testing and certification
- Regular client reporting
- Third-party quality audits
- 24-month warranty on all works

## Health, Safety & Environment

Safety is our top priority. Our HSE program includes:
- Certified safety officers on all sites
- Daily safety briefings
- Proper traffic management plans
- Environmental protection measures
- Emergency response procedures

## Project Team

### Key Personnel:
- Project Manager: Eng. Ahmad Hassan (15+ years experience)
- Site Supervisor: Encik Rahman Ali (CIDB certified)
- Safety Officer: Puan Siti Aminah (NIOSH certified)
- Quality Controller: Eng. David Lim (Materials testing certified)

## Equipment and Resources

We have adequate equipment for this project:
- Asphalt pavers and compactors
- Excavators and dump trucks
- Road marking equipment
- Testing equipment
- Safety and traffic management equipment

## Pricing

Our competitive pricing is based on detailed analysis of project requirements:

### Summary of Costs:
- Materials: RM 1,200,000
- Labor: RM 800,000
- Equipment: RM 300,000
- Overheads: RM 150,000
- Profit: RM 50,000

**Total Project Cost: RM 2,500,000**

*Note: Detailed Bill of Quantities (BOQ) is attached as a separate document.*

## Value Proposition

Choosing our company provides:
- Proven track record in similar projects
- Competitive pricing with no hidden costs
- Experienced and certified team
- Modern equipment and technology
- Strong commitment to quality and safety
- Local presence for quick response

## Conclusion

We are confident that our experience, expertise, and commitment make us the ideal partner for this important infrastructure project. We look forward to the opportunity to contribute to the improvement of Kuala Lumpur's road network.

Thank you for considering our proposal. We are available for any clarifications or discussions.

---

*This proposal is valid for 30 days from the date of submission.*
*All work will be carried out in accordance with JKR specifications and local authority requirements.*`;

export default function ProposalEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();
  
  const [proposalContent, setProposalContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [versions, setVersions] = useState([
    { id: 1, timestamp: new Date("2025-01-15T10:30:00"), label: "Initial Draft" },
    { id: 2, timestamp: new Date("2025-01-15T14:15:00"), label: "Added Technical Details" },
    { id: 3, timestamp: new Date("2025-01-15T16:45:00"), label: "Updated Pricing" },
  ]);

  // Fetch proposal data
  const { data: proposal, error, isLoading } = useSWR(
    id ? `/api/proposals/${id}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (data && proposalContent === '') {
          setProposalContent(data.content || mockProposalTemplate);
        }
      }
    }
  );

  // Auto-save functionality
  useEffect(() => {
    if (!proposalContent || !id) return;
    
    const autoSave = setTimeout(() => {
      handleSaveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [proposalContent, id]);

  const handleSaveDraft = async () => {
    if (!id || !proposalContent) return;
    
    try {
      await api('/api/saveDraft', {
        method: 'POST',
        body: { proposalId: id, content: proposalContent }
      });
      setLastSaved(new Date());
      console.log("Draft saved");
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleSubmitProposal = async () => {
    setIsSubmitting(true);
    
    try {
      // Save final content first
      await handleSaveDraft();
      
      // Submit proposal
      const result = await api('/api/submitProposal', {
        method: 'POST',
        body: { proposalId: id }
      });
      
      addToast(`Proposal submitted successfully! Transaction ID: ${result.txId}`, 'success');
      router.push('/reputation');
    } catch (error) {
      addToast('Failed to submit proposal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertCompanyInfo = (section) => {
    const companyInfo = {
      background: "\n\n**Company Background:**\nEstablished construction company with CIDB G5 certification and 8+ years of experience in road maintenance and infrastructure projects.\n\n",
      certifications: "\n\n**Certifications:**\n- CIDB Grade G5\n- ISO 9001:2015\n- Valid Contractor License\n- CIDB Certified Supervisors\n\n",
      experience: "\n\n**Recent Projects:**\n- Federal Highway Maintenance (2023) - RM 1.2M\n- Shah Alam Road Repairs (2022) - RM 800K\n- Klang Valley Drainage Works (2021) - RM 950K\n\n"
    };

    const insertion = companyInfo[section] || "";
    const cursorPosition = 0; // In real app, get actual cursor position
    const newContent = proposalContent.slice(0, cursorPosition) + insertion + proposalContent.slice(cursorPosition);
    setProposalContent(newContent);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-1/2"></div>
          <div className="skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load proposal. Please try again.</p>
        </div>
      </div>
    );
  }

  const isSubmitted = proposal?.status === 'submitted';
  const tenderId = proposal?.tenderId || '1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/tenders/${tenderId}`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tender Details</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposal Editor</h1>
            <p className="text-gray-600">
              {proposal?.tenderTitle || "Road Maintenance and Repair Services - Kuala Lumpur District"}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <span className="text-sm text-gray-500 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Saved {format(lastSaved, "HH:mm")}</span>
              </span>
            )}
            {!isSubmitted && (
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Proposal Content</CardTitle>
                {!isSubmitted && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Improve
                    </Button>
                    <Button variant="outline" size="sm">
                      <History className="w-4 h-4 mr-2" />
                      Versions
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={proposalContent}
                onChange={(e) => setProposalContent(e.target.value)}
                readOnly={isSubmitted}
                className={`w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isSubmitted ? 'bg-gray-50 cursor-default' : ''
                }`}
                placeholder="Start writing your proposal..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Insert */}
          {!isSubmitted && (
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
                >
                  Company Background
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => insertCompanyInfo('certifications')}
                >
                  Certifications
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => insertCompanyInfo('experience')}
                >
                  Past Experience
                </Button>
              </CardContent>
            </Card>
          )}

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
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium">{version.label}</p>
                      <p className="text-xs text-gray-500">{format(version.timestamp, "MMM d, HH:mm")}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submission Panel */}
          {!isSubmitted ? (
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
                    disabled={isSubmitting}
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
          ) : (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <CheckCircle className="w-5 h-5" />
                  <span>Proposal Submitted</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  This proposal has been submitted and recorded on the blockchain. No further edits are allowed.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tender Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Tender Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <p className="font-semibold">RM 2,500,000</p>
                </div>
                <div>
                  <span className="text-gray-500">Closing:</span>
                  <p className="font-semibold">Feb 15, 2025</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-semibold">Construction</p>
                </div>
              </div>
              <Link href={`/tenders/${tenderId}`} className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Tender
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}