// pages/reputation.js
// Reputation page using Supabase data with SWR

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Award, Shield, ExternalLink, Calendar, CheckCircle, TrendingUp, FileText, Clock as Blockchain, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import ReputationTable from '../components/ReputationTable';

// Mock reputation metrics
const reputationMetrics = {
  totalSubmissions: 15,
  reputationScore: 850,
  onChainProofs: 15,
  averageResponseTime: '2.3 days',
  successRate: '73%',
  totalBidValue: 'RM 45,200,000'
};

export default function ReputationPage() {
  // Fetch attestations data from the API using SWR
  const { data: attestations, error, isLoading } = useSWR('/api/attestations', fetcher);

  const getReputationLevel = (score) => {
    if (score >= 900) return { level: 'Platinum', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (score >= 750) return { level: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score >= 600) return { level: 'Silver', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    return { level: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100' };
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
          {/* Error state */}
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load reputation data. Please try again.</p>
            </div>
          ) : isLoading ? (
            // Loading state
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
          ) : (
            <ReputationTable attestations={attestations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}