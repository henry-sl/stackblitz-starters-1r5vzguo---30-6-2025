// components/ProposalEditor/ExportControls.jsx
// Component for exporting proposals in different formats
// Provides download options and export settings

import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';

export default function ExportControls({ content, proposalTitle = "Proposal" }) {
  const { addToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Export formats
  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: DocumentTextIcon,
      description: 'Professional PDF format for submission'
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: DocumentTextIcon,
      description: 'Microsoft Word format for editing'
    },
    {
      id: 'txt',
      name: 'Plain Text',
      icon: DocumentTextIcon,
      description: 'Simple text format'
    }
  ];

  // Handle export
  const handleExport = async (format) => {
    try {
      setExporting(true);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (format) {
        case 'txt':
          downloadTextFile();
          break;
        case 'pdf':
          // In real app, would generate PDF
          addToast('PDF export would be generated here', 'info');
          break;
        case 'docx':
          // In real app, would generate DOCX
          addToast('Word document export would be generated here', 'info');
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      addToast(`Proposal exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
      setShowOptions(false);
    }
  };

  // Download as text file
  const downloadTextFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proposalTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick export as PDF
  const handleQuickExport = () => {
    handleExport('pdf');
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Quick Export Button */}
        <button
          onClick={handleQuickExport}
          disabled={exporting || !content.trim()}
          className="btn btn-primary"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>

        {/* Export Options Button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={exporting || !content.trim()}
          className="btn btn-secondary"
        >
          <Cog6ToothIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Export Options Dropdown */}
      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Options</h4>
            
            <div className="space-y-2">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleExport(format.id)}
                    disabled={exporting}
                    className="w-full flex items-start space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <IconComponent className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Export Settings */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Export Settings</h5>
              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  Include header and footer
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  Add page numbers
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  Include watermark
                </label>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowOptions(false)}
                className="w-full btn btn-secondary text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}