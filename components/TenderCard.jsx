// components/TenderCard.jsx
// This component renders a card for a single tender in the tenders list
// It displays key information about the tender and links to the detailed view
// Updated with eligibility scoring display

import Link from 'next/link';
import { CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { Badge } from './ui/badge';

export default function TenderCard({ tender, eligibilitySummary }) {
  const { id, title, agency, closingDate, category, isNew } = tender;
  
  // Calculate days until closing date
  const daysUntilClosing = Math.ceil(
    (new Date(closingDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  
  // Determine if the tender is closing soon (within 7 days)
  const isClosingSoon = daysUntilClosing <= 7 && daysUntilClosing > 0;

  // Get eligibility badge styling
  const getEligibilityBadge = () => {
    if (!eligibilitySummary) return null;
    
    const { status, score, message } = eligibilitySummary;
    
    switch (status) {
      case 'high_match':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>{score}% Match</span>
          </Badge>
        );
      case 'medium_match':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            <span>{score}% Match</span>
          </Badge>
        );
      case 'low_match':
        return (
          <Badge className="bg-orange-100 text-orange-800 flex items-center space-x-1">
            <XCircle className="h-3 w-3 mr-1" />
            <span>{score}% Match</span>
          </Badge>
        );
      case 'incomplete_profile':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            <span>Complete Profile</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/tenders/${id}`}>
      <div className="card cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* Tender title with line clamp to limit to 2 lines */}
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>
          </div>
          <div className="flex space-x-2 ml-4">
            {/* Badge for new tenders */}
            {isNew && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                New
              </span>
            )}
            {/* Badge for tenders closing soon */}
            {isClosingSoon && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-yellow-800">
                Closing Soon
              </span>
            )}
            {/* Eligibility badge */}
            {getEligibilityBadge()}
          </div>
        </div>
        
        {/* Tender metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Agency information */}
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            <span>{agency}</span>
          </div>
          {/* Closing date information */}
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Closes: {new Date(closingDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Category badge */}
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {category}
          </span>
        </div>
      </div>
    </Link>
  );
}