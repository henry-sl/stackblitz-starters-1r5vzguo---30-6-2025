// components/EligibilityBox.jsx
// This component displays the AI-generated eligibility assessment for a tender
// It shows whether the company meets each requirement of the tender

import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function EligibilityBox({ eligibility, loading }) {
  // Show loading skeleton while eligibility is being checked
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center mb-3">
          <ShieldCheckIcon className="h-5 w-5 text-secondary mr-2" />
          <h3 className="text-lg font-semibold">Eligibility Check</h3>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show the eligibility assessment results
  return (
    <div className="card">
      <div className="flex items-center mb-3">
        <ShieldCheckIcon className="h-5 w-5 text-secondary mr-2" />
        <h3 className="text-lg font-semibold">Eligibility Check</h3>
      </div>
      <div className="space-y-2">
        {/* Map through each eligibility item and display with appropriate icon */}
        {eligibility.map((item, index) => (
          <div key={index} className="flex items-start">
            {item.eligible ? (
              // Check icon for requirements that are met
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              // X icon for requirements that are not met
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <span className={`text-sm ${item.eligible ? 'text-green-700' : 'text-red-700'}`}>
              {item.requirement}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}