// components/ProposalEditor/AutosaveIndicator.jsx
// Component showing autosave status and last saved time
// Provides visual feedback for document saving state

import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function AutosaveIndicator({ 
  status = 'saved', // 'saving', 'saved', 'error'
  lastSaved 
}) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: ClockIcon,
          text: 'Saving...',
          color: 'text-yellow-600'
        };
      case 'saved':
        return {
          icon: CheckCircleIcon,
          text: 'All changes saved',
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: ExclamationCircleIcon,
          text: 'Save failed',
          color: 'text-red-600'
        };
      default:
        return {
          icon: ClockIcon,
          text: 'Unknown status',
          color: 'text-gray-600'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
      <span className={statusDisplay.color}>{statusDisplay.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-gray-500">
          • Last saved {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}