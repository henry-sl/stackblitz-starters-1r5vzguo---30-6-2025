import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Mock tender data (in real app, this would come from API)
const mockTender = {
  id: "1",
  title: "Road Maintenance and Repair Services - Kuala Lumpur District",
  agency: "Kuala Lumpur City Hall (DBKL)",
  category: "Construction",
  location: "Kuala Lumpur",
  budget: "RM 2,500,000",
  closingDate: new Date("2025-02-15"),
  publishedDate: new Date("2025-01-10"),
  tenderId: "DBKL/2025/ROAD/001",
  description: `This tender is for comprehensive road maintenance and repair services across the Kuala Lumpur district. The scope includes:

1. Pothole repairs and road resurfacing
2. Drainage system improvements and maintenance
3. Road marking and signage updates
4. Traffic management during construction
5. Quality assurance and warranty provisions

The contractor will be responsible for maintaining major roads including Jalan Tun Razak, Jalan Ampang, and connecting arterial roads. All work must comply with JKR specifications and local authority requirements.

The project duration is 24 months with possible extension based on performance. Regular progress reports and quality inspections will be conducted throughout the project lifecycle.`,
  requirements: [
    "CIDB Grade G4 or above certification",
    "Minimum 5 years experience in road construction and maintenance",
    "Valid contractor license from relevant authorities",
    "Proven track record of similar projects worth at least RM 1 million",
    "Adequate equipment and machinery for road works",
    "Qualified site supervisors and safety officers"
  ],
  documents: [
    { name: "Tender Document", size: "2.4 MB", type: "PDF" },
    { name: "Technical Specifications", size: "1.8 MB", type: "PDF" },
    { name: "Site Plans", size: "5.2 MB", type: "PDF" },
    { name: "BOQ Template", size: "156 KB", type: "Excel" }
  ],
  contactInfo: {
    officer: "Encik Ahmad Rahman",
    email: "ahmad.rahman@dbkl.gov.my",
    phone: "+603-2691-1234",
    office: "Engineering Department, DBKL"
  },
  status: "new",
  tags: ["Road Works", "Maintenance", "Urban"]
};

export const TenderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [aiSummary, setAiSummary] = useState(null);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Mock AI functions (in real app, these would call actual AI APIs)
  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiSummary(`This tender is for comprehensive road maintenance services in Kuala Lumpur with a budget of RM 2.5 million. Key requirements include CIDB G4+ certification and 5+ years experience. The 24-month project covers pothole repairs, resurfacing, and drainage improvements across major KL roads. Contractors need adequate equipment and qualified supervisors. This is a substantial opportunity for established road construction companies with proven track records.`);
    setIsGeneratingSummary(false);
  };

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEligibilityCheck({
      overall: "qualified",
      checks: [
        { requirement: "CIDB Grade G4 or above", status: "pass", note: "Your company has G5 certification" },
        { requirement: "5+ years experience", status: "pass", note: "8 years of road construction experience" },
        { requirement: "Valid contractor license", status: "pass", note: "License valid until 2026" },
        { requirement: "RM 1M+ project experience", status: "warning", note: "Largest project was RM 800K - consider partnering" },
        { requirement: "Equipment and machinery", status: "pass", note: "Adequate equipment inventory listed" },
        { requirement: "Qualified supervisors", status: "pass", note: "3 certified site supervisors on staff" }
      ]
    });
    setIsCheckingEligibility(false);
  };

  const generateProposal = async () => {
    setIsGeneratingProposal(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push(`/proposal/${id}`);
  };

  const getDaysUntilClosing = (closingDate) => {
    return formatDistanceToNow(closingDate, { addSuffix: true });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>;
      case "closing-soon":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closing Soon</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

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
                    {mockTender.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{mockTender.agency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mockTender.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{mockTender.tenderId}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockTender.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {getStatusBadge(mockTender.status)}
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
                  <span>{isGeneratingSummary ? "Generating..." : "AI Summary"}</span>
                </Button>
                
                <Button
                  onClick={checkEligibility}
                  disabled={isCheckingEligibility}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>{isCheckingEligibility ? "Checking..." : "Check Eligibility"}</span>
                </Button>
                
                <Button
                  onClick={generateProposal}
                  disabled={isGeneratingProposal}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>{isGeneratingProposal ? "Generating..." : "Generate Proposal"}</span>
                </Button>
              </div>

              {/* AI Summary Result */}
              {aiSummary && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summary</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Play className="w-4 h-4" />
                    </Button>
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{aiSummary}</p>
                </div>
              )}

              {/* Eligibility Check Result */}
              {eligibilityCheck && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Eligibility Assessment</span>
                    <Badge className={eligibilityCheck.overall === "qualified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {eligibilityCheck.overall === "qualified" ? "Qualified" : "Partially Qualified"}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {eligibilityCheck.checks.map((check, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                          check.status === "pass" ? "bg-green-100" : 
                          check.status === "warning" ? "bg-yellow-100" : "bg-red-100"
                        }`}>
                          {check.status === "pass" ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{check.requirement}</p>
                          <p className="text-gray-600">{check.note}</p>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Project Description</h3>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {mockTender.description}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements & Qualifications</h3>
                <ul className="space-y-3">
                  {mockTender.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="documents" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tender Documents</h3>
                <div className="space-y-3">
                  {mockTender.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tender Officer</label>
                    <p className="text-gray-900">{mockTender.contactInfo.officer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{mockTender.contactInfo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{mockTender.contactInfo.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Office</label>
                    <p className="text-gray-900">{mockTender.contactInfo.office}</p>
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
                <label className="text-sm font-medium text-gray-500">Budget</label>
                <p className="text-xl font-bold text-gray-900">{mockTender.budget}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Closing Date</label>
                <p className="font-semibold text-gray-900">{format(mockTender.closingDate, "PPP")}</p>
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getDaysUntilClosing(mockTender.closingDate)}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Published</label>
                <p className="text-gray-900">{format(mockTender.publishedDate, "PPP")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900">{mockTender.category}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/proposal/${id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Proposal
                </Button>
              </Link>
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
};

export default TenderDetails;