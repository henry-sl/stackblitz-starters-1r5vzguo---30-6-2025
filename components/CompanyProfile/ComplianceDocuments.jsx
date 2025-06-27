// components/CompanyProfile/ComplianceDocuments.jsx
// Component for managing compliance documents and certifications
// Integrates with FileUploader for document management

import React, { useState } from 'react';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';
import FileUploader from './FileUploader';
import { useToast } from '../../hooks/useToast';

export default function ComplianceDocuments() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'ISO 9001 Certificate.pdf',
      type: 'Quality Management',
      expiryDate: '2025-06-15',
      status: 'valid',
      size: 2048576,
      uploadedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Business License.pdf',
      type: 'Business Registration',
      expiryDate: '2024-12-31',
      status: 'expiring_soon',
      size: 1536000,
      uploadedAt: '2024-01-10T14:20:00Z'
    }
  ]);

  // Handle new file upload
  const handleFileUpload = (file) => {
    const newDocument = {
      ...file,
      type: 'General Document',
      expiryDate: null,
      status: 'valid'
    };
    
    setDocuments(prev => [...prev, newDocument]);
    addToast('Document uploaded successfully!', 'success');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-50';
      case 'expired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <DocumentCheckIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Compliance Documents</h3>
      </div>

      {/* Document Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Required Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Business Registration Certificate',
            'Tax Clearance Certificate',
            'ISO Quality Certifications',
            'Insurance Certificates',
            'Financial Statements',
            'Safety Compliance Documents'
          ].map((docType) => (
            <div key={docType} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{docType}</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Uploader */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Upload New Documents</h4>
        <FileUploader
          onFileUpload={handleFileUpload}
          acceptedTypes=".pdf,.doc,.docx,.jpg,.png"
          maxSize={10}
        />
      </div>

      {/* Existing Documents */}
      {documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Documents</h4>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <DocumentCheckIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {doc.expiryDate && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="text-sm text-gray-900">
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {getStatusText(doc.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}