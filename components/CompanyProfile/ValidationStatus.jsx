// components/CompanyProfile/ValidationStatus.jsx
// Component showing company compliance and validation status
// Displays verification progress and required actions

import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function ValidationStatus({ companyData }) {
  // Mock validation data - in real app this would come from API
  const validationItems = [
    {
      id: 1,
      title: 'Business Registration',
      status: 'verified',
      description: 'Company registration verified with government records',
      completedAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Tax Compliance',
      status: 'verified',
      description: 'Tax clearance certificate validated',
      completedAt: '2024-01-20'
    },
    {
      id: 3,
      title: 'Financial Standing',
      status: 'pending',
      description: 'Financial statements under review',
      action: 'Upload latest financial statements'
    },
    {
      id: 4,
      title: 'Insurance Coverage',
      status: 'warning',
      description: 'Insurance certificate expires in 30 days',
      action: 'Renew insurance certificate'
    },
    {
      id: 5,
      title: 'Quality Certifications',
      status: 'verified',
      description: 'ISO 9001:2015 certification validated',
      completedAt: '2024-01-10'
    }
  ];

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Calculate overall compliance score
  const verifiedCount = validationItems.filter(item => item.status === 'verified').length;
  const complianceScore = Math.round((verifiedCount / validationItems.length) * 100);

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <ShieldCheckIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Validation Status</h3>
      </div>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-blue-900">Compliance Score</h4>
            <p className="text-sm text-blue-700">
              {verifiedCount} of {validationItems.length} validations completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">{complianceScore}%</div>
            <div className="w-24 bg-blue-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Items */}
      <div className="space-y-4">
        {validationItems.map((item) => {
          const statusDisplay = getStatusDisplay(item.status);
          const StatusIcon = statusDisplay.icon;

          return (
            <div 
              key={item.id} 
              className={`p-4 border rounded-lg ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}
            >
              <div className="flex items-start space-x-3">
                <StatusIcon className={`h-5 w-5 mt-0.5 ${statusDisplay.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{item.title}</h5>
                    <span className={`text-xs font-medium ${statusDisplay.color}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  
                  {item.completedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completed on {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {item.action && (
                    <div className="mt-3">
                      <button className="text-sm font-medium text-primary hover:text-blue-700">
                        {item.action} →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className="btn btn-primary">
          Request Verification Review
        </button>
        <button className="btn btn-secondary">
          Download Compliance Report
        </button>
      </div>
    </div>
  );
}