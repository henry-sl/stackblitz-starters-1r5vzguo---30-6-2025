// components/Toast.jsx
// This component renders a single toast notification
// It displays different styles based on the toast type (success, error, info)

import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

// Map of icons to use for different toast types
const icons = {
  success: CheckCircleIcon,
  error: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

// Map of color schemes for different toast types
const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Toast({ toast, onRemove }) {
  // Get the appropriate icon component based on toast type
  const Icon = icons[toast.type];
  
  return (
    <div className={`p-4 rounded-md border ${colors[toast.type]} shadow-lg`}>
      <div className="flex">
        {/* Icon based on toast type */}
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        
        {/* Toast message */}
        <div className="ml-3">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        
        {/* Close button */}
        <div className="ml-auto pl-3">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex rounded-md p-1.5 hover:bg-gray-100"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}