// pages/tenders/index.js
// Updated tenders listing page with new design and functionality
// Integrates with existing API endpoints and maintains Next.js routing

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '../../lib/api';
import Badge from '../../components/Badge';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  CalendarIcon, 
  MapPinIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function TenderFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Fetch tenders data from API
  const { data: tenders, error, isLoading } = useSWR('/api/tenders', fetcher);

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

  const getStatusBadge = (tender) => {
    const daysUntilClosing = Math.ceil(
      (new Date(tender.closingDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    if (tender.isNew) {
      return <Badge variant="success">New</Badge>;
    } else if (daysUntilClosing <= 7 && daysUntilClosing > 0) {
      return <Badge variant="error">Closing Soon</Badge>;
    } else {
      return <Badge variant="secondary">Active</Badge>;
    }
  };

  const getDaysUntilClosing = (closingDate) => {
    return formatDistanceToNow(new Date(closingDate), { addSuffix: true });
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tenders</h1>
        <p className="text-gray-600">Discover and bid on government and private sector opportunities</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tenders by title, agency, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
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

          <button className="btn btn-secondary flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>More Filters</span>
          </button>
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
            <div key={tender.id} className="card hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              {/* Header */}
              <div className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {tender.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{tender.agency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>Malaysia</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(tender)}
                </div>
              </div>

              {/* Content */}
              <div className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tender.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{tender.category}</Badge>
                  {tender.isNew && <Badge variant="outline">Featured</Badge>}
                </div>

                {/* Tender Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-semibold text-gray-900">{tender.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Closing:</span>
                    <p className="font-semibold text-gray-900 flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{getDaysUntilClosing(tender.closingDate)}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link href={`/tenders/${tender.id}`} className="flex-1">
                    <button className="w-full btn btn-primary">
                      View Details
                    </button>
                  </Link>
                  <button className="btn btn-secondary flex items-center space-x-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span>AI Assist</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}