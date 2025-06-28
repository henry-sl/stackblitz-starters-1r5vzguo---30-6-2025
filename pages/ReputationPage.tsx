import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Award, Shield, ExternalLink, Calendar, CheckCircle, TrendingUp, FileText, Blocks as Blockchain, Trophy } from "lucide-react";
import { format } from "date-fns";

// Mock blockchain attestation data
const mockAttestations = [
  {
    id: "1",
    tenderTitle: "Road Maintenance and Repair Services - KL District",
    submissionDate: new Date("2025-01-15T16:30:00"),
    transactionId: "ALGO_TX_7K8M9N2P4Q5R",
    blockHeight: 12345678,
    status: "confirmed",
    tenderValue: "RM 2,500,000",
    agency: "DBKL"
  },
  {
    id: "2",
    tenderTitle: "IT Infrastructure Upgrade - Government Buildings",
    submissionDate: new Date("2025-01-10T14:20:00"),
    transactionId: "ALGO_TX_3F4G5H6J7K8L",
    blockHeight: 12344521,
    status: "confirmed",
    tenderValue: "RM 1,800,000",
    agency: "Ministry of Digital Development"
  },
  {
    id: "3",
    tenderTitle: "School Building Construction - Selangor",
    submissionDate: new Date("2025-01-05T11:45:00"),
    transactionId: "ALGO_TX_9M1N2P3Q4R5S",
    blockHeight: 12343876,
    status: "confirmed",
    tenderValue: "RM 8,500,000",
    agency: "Ministry of Education"
  },
  {
    id: "4",
    tenderTitle: "Waste Management System Implementation",
    submissionDate: new Date("2024-12-28T09:15:00"),
    transactionId: "ALGO_TX_6T7U8V9W1X2Y",
    blockHeight: 12342109,
    status: "confirmed",
    tenderValue: "RM 3,200,000",
    agency: "Selangor State Government"
  }
];

// Mock reputation metrics
const reputationMetrics = {
  totalSubmissions: 15,
  reputationScore: 850,
  onChainProofs: 15,
  averageResponseTime: "2.3 days",
  successRate: "73%",
  totalBidValue: "RM 45,200,000"
};

export const ReputationPage = (): JSX.Element => {
  const getAlgorandExplorerUrl = (transactionId: string) => {
    return `https://testnet.algoexplorer.io/tx/${transactionId}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 900) return { level: "Platinum", color: "text-purple-600", bgColor: "bg-purple-100" };
    if (score >= 750) return { level: "Gold", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (score >= 600) return { level: "Silver", color: "text-gray-600", bgColor: "bg-gray-100" };
    return { level: "Bronze", color: "text-orange-600", bgColor: "bg-orange-100" };
  };

  const reputation = getReputationLevel(reputationMetrics.reputationScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reputation & Blockchain Proofs</h1>
        <p className="text-gray-600">
          Your transparent, tamper-proof record of tender submissions powered by Algorand blockchain
        </p>
      </div>

      {/* Reputation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Reputation Score */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Reputation Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {reputationMetrics.reputationScore}
              </div>
              <Badge className={`${reputation.bgColor} ${reputation.color} hover:${reputation.bgColor} text-lg px-3 py-1`}>
                {reputation.level}
              </Badge>
              <p className="text-sm text-gray-600 mt-3">
                Based on submission history, response time, and blockchain verification
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reputationMetrics.totalSubmissions}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reputationMetrics.onChainProofs}</div>
                <div className="text-sm text-gray-600">Blockchain Proofs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{reputationMetrics.averageResponseTime}</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{reputationMetrics.successRate}</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center md:col-span-2">
                <div className="text-2xl font-bold text-gray-600">{reputationMetrics.totalBidValue}</div>
                <div className="text-sm text-gray-600">Total Bid Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Explanation */}
      <Card className="mb-8 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Shield className="w-5 h-5" />
            <span>About Blockchain Attestations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Blockchain className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Tamper-Proof Records</h4>
                <p className="text-sm text-blue-700">
                  Every proposal submission is recorded on Algorand blockchain, creating an immutable timestamp that cannot be altered.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Public Verification</h4>
                <p className="text-sm text-blue-700">
                  Anyone can verify your submission history using the Algorand explorer, building trust with potential partners.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Reputation Building</h4>
                <p className="text-sm text-blue-700">
                  Your consistent participation creates a verifiable track record that enhances your credibility.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Submission History</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All on Blockchain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAttestations.map((attestation) => (
              <div key={attestation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {attestation.tenderTitle}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Agency:</span>
                        <p>{attestation.agency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span>
                        <p className="font-semibold text-gray-900">{attestation.tenderValue}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p>{format(attestation.submissionDate, "PPp")}</p>
                      </div>
                      <div>
                        <span className="font-medium">Block Height:</span>
                        <p className="font-mono">{attestation.blockHeight.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        {getStatusBadge(attestation.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {attestation.transactionId}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getAlgorandExplorerUrl(attestation.transactionId), '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Proof
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {mockAttestations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600 mb-4">
                Start submitting proposals to build your blockchain-verified reputation.
              </p>
              <Button>
                Browse Tenders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};