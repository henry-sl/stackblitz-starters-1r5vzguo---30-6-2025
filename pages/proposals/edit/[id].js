import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentIcon,
  ClockIcon,
  SparklesIcon,
  HistoryIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// Mock proposal template matching the screenshot
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

export default function ProposalEditor() {
  const router = useRouter();
  const { id } = router.query;
  
  const [proposalContent, setProposalContent] = useState(mockProposalTemplate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [versions] = useState([
    { id: 1, timestamp: new Date("2025-01-15T10:30:00"), label: "Initial Draft" },
    { id: 2, timestamp: new Date("2025-01-15T14:15:00"), label: "Added Technical Details" },
    { id: 3, timestamp: new Date("2025-01-15T16:45:00"), label: "Updated Pricing" },
  ]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      handleSaveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [proposalContent]);

  const handleSaveDraft = () => {
    setLastSaved(new Date());
    console.log("Draft saved");
  };

  const handleSubmitProposal = async () => {
    setIsSubmitting(true);
    
    // Simulate blockchain attestation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    alert("Proposal submitted successfully! Blockchain attestation recorded.");
    setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/tenders/${id}`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm">Back to Tender Details</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <span className="text-sm text-gray-500 flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </span>
            )}
            <button 
              onClick={handleSaveDraft}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <DocumentIcon className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-xl font-semibold text-gray-900">Proposal Editor</h1>
          <p className="text-sm text-gray-600">Road Maintenance and Repair Services - Kuala Lumpur District</p>
        </div>
      </div>

      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200 h-full">
            {/* Editor Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Proposal Content</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    <SparklesIcon className="w-4 h-4" />
                    <span>AI Improve</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    <HistoryIcon className="w-4 h-4" />
                    <span>Versions</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="p-6">
              <textarea
                value={proposalContent}
                onChange={(e) => setProposalContent(e.target.value)}
                className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start writing your proposal..."
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Quick Insert */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Quick Insert</h3>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => insertCompanyInfo('background')}
                className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Company Background
              </button>
              <button 
                onClick={() => insertCompanyInfo('certifications')}
                className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Certifications
              </button>
              <button 
                onClick={() => insertCompanyInfo('experience')}
                className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Past Experience
              </button>
            </div>
          </div>

          {/* Version History */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <HistoryIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Version History</h3>
            </div>
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{version.label}</p>
                    <p className="text-xs text-gray-500">
                      {version.timestamp.toLocaleDateString()} {version.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Proposal */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-green-900">Submit Proposal</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex items-start space-x-2 text-sm text-gray-700 mb-3">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p>Submitting will record your proposal on the Algorand blockchain and lock further edits.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Proposal content ready</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Company profile complete</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">All requirements met</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmitProposal}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting to Blockchain...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Submit Proposal</span>
                </>
              )}
            </button>
          </div>

          {/* Tender Reference */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tender Reference</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Budget:</span>
                <p className="font-semibold text-gray-900">RM 2,500,000</p>
              </div>
              <div>
                <span className="text-gray-500">Closing:</span>
                <p className="font-semibold text-gray-900">Feb 15, 2025</p>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-semibold text-gray-900">Construction</p>
              </div>
            </div>
            <Link href={`/tenders/${id}`} className="block mt-3">
              <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                View Full Tender
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}