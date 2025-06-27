// components/VersionDrawer.jsx
// This component provides a side drawer to display and select from version history
// It allows users to view and restore previous versions of their proposals

import { useState } from 'react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function VersionDrawer({ isOpen, onClose, versions, onSelectVersion }) {
  // Track which version is currently selected
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Handle clicking on a version in the list
  const handleVersionClick = (version) => {
    setSelectedVersion(version);
  };

  // Handle restoring the selected version
  const handleRestore = () => {
    if (selectedVersion) {
      onSelectVersion(selectedVersion);
      onClose();
    }
  };

  return (
    <>
      {/* Background overlay - only visible when drawer is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Side drawer panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Version History</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Versions list */}
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                selectedVersion?.id === version.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleVersionClick(version)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Version {version.version}</span>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(version.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">
                {version.content.substring(0, 100)}...
              </p>
            </div>
          ))}
          
          {/* Restore button - only shown when a version is selected */}
          {selectedVersion && (
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
              <button
                onClick={handleRestore}
                className="w-full btn btn-primary"
              >
                Restore This Version
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}