// components/CompanyProfile/ProfileHeader.jsx
// Header component for the company profile page showing company overview and key metrics
// Displays company name, verification status, and quick stats

import React from 'react';
import { BuildingOfficeIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/24/outline';

export default function ProfileHeader({ companyData, completionPercentage }) {
  return (
    <div className="card mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {/* Company Logo/Icon */}
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {companyData?.name || 'Your Company Name'}
              </h1>
              {companyData?.verified && (
                <CheckBadgeIcon className="h-6 w-6 text-green-500" />
              )}
            </div>
            <p className="text-gray-600">
              Registration: {companyData?.registrationNumber || 'Not provided'}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">4.8 Rating</span>
              </div>
              <span className="text-sm text-gray-600">12 Completed Projects</span>
            </div>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Profile Completion</div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}