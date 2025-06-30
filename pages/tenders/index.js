// pages/tenders/index.js
// Updated tenders listing page with new modern design and eligibility scoring
// Converted from React Router to Next.js routing

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher, api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import TenderCard from '../../components/TenderCard';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building, 
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TenderFeed() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [eligibilitySummaries, setEligibilitySummaries] = useState({});
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);

  // Fetch tenders data from API
  const { data: tenders, error, isLoading } = useSWR('/api/tenders', fetcher);
  
  // Fetch company profile for eligibility checking
  const { data: companyProfile } = useSWR(
    user ? '/api/company' : null,
    fetcher
  );

  // Available categories and locations for filtering
  const categories = ['all', 'Construction', 'IT Services', 'Healthcare', 'Consulting'];
  const locations = ['all', 'Kuala Lumpur', 'Putrajaya', 'Selangor', 'Johor'];

  // Filter tenders based on search and filters
  const filteredTenders = tenders?.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tender.category === selectedCategory;
    // For location filtering, we'll use a simple match since our mock data doesn't have location field
    const matchesLocation = selectedLocation === 'all';
    
    return matchesSearch && matchesCategory && matchesLocation;
  }) || [];

  // Fetch eligibility summaries when tenders and company profile are loaded
  useEffect(() => {
    const fetchEligibilitySummaries = async () => {
      if (!user || !tenders || tenders.length === 0 || !companyProfile) {
        return;
      }

      try {
        setIsLoadingEligibility(true);
        const tenderIds = tenders.map(tender => tender.id);
        
        const result = await api('/api/eligibilitySummary', {
          method: 'POST',
          body: { tenderIds }
        });
        
        setEligibilitySummaries(result);
      } catch (error) {
        console.error('Error fetching eligibility summaries:', error);
      } finally {
        setIsLoadingEligibility(false);
      }
    };

    fetchEligibilitySummaries();
  }, [tenders, companyProfile, user]);

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load tenders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Available Tenders</h1>
          {user && (
            <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1 px-3 py-1">
              <ShieldCheck className="w-4 h-4 mr-1" />
              <span>Eligibility Scoring Active</span>
            </Badge>
          )}
        </div>
        <p className="text-gray-600">Discover and bid on government and private sector opportunities</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tenders by title, agency, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === 'all' ? 'All Locations' : location}
              </option>
            ))}
          </select>

          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredTenders.length} of {tenders?.length || 0} tenders
        </p>
      </div>

      {/* Tender Cards */}
      {isLoading ? (
        // Loading state - skeleton cards
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card border-l-4 border-l-blue-500">
              <div className="skeleton h-6 w-3/4 mb-3"></div>
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-2/3 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="skeleton h-6 w-16"></div>
                <div className="skeleton h-6 w-20"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
              </div>
              <div className="flex space-x-3">
                <div className="skeleton h-10 flex-1"></div>
                <div className="skeleton h-10 w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTenders.length > 0 ? (
        // Render tender cards when data is available
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredTenders.map((tender) => (
            <TenderCard 
              key={tender.id} 
              tender={tender} 
              eligibilitySummary={eligibilitySummaries[tender.id]}/>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Eligibility Scoring Information */}
      {user && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">About Eligibility Scoring</h3>
              <p className="text-blue-800 mb-4">
                Tenders are automatically scored based on your company profile and certifications. 
                The system analyzes requirements like CIDB grade, experience, and certifications to 
                determine your eligibility.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">High Match</Badge>
                  <span className="text-blue-800">80-100% match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Medium Match</Badge>
                  <span className="text-blue-800">50-79% match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800">Low Match</Badge>
                  <span className="text-blue-800">Below 50% match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}