// components/CompanyProfile/CertificationsList.jsx
// Dynamic certifications list component for Malaysia-specific certifications
// Provides comprehensive certification management with file uploads

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import FileUploader from './FileUploader';
import { Plus, Trash2, Upload, Calendar, Award, AlertTriangle } from 'lucide-react';

// Malaysia-specific certifications master list
const MALAYSIA_CERTIFICATIONS = [
  {
    category: 'Construction / Civil',
    items: [
      'CIDB Contractor Grade G1',
      'CIDB Contractor Grade G2', 
      'CIDB Contractor Grade G3',
      'CIDB Contractor Grade G4',
      'CIDB Contractor Grade G5',
      'CIDB Contractor Grade G6',
      'CIDB Contractor Grade G7',
      'PKK / Bumiputera Status',
      'SPKK Work Pass (Bumiputera contractor)'
    ]
  },
  {
    category: 'Supply & Services',
    items: [
      'MOF ePerolehan Registration',
      'Digital Certificate (ePerolehan)'
    ]
  },
  {
    category: 'Oil & Gas',
    items: [
      'PETRONAS Vendor Licence',
      'PETRONAS VIMS Registration'
    ]
  },
  {
    category: 'Electrical / Energy',
    items: [
      'Suruhanjaya Tenaga Electrical Contractor Class A',
      'Suruhanjaya Tenaga Electrical Contractor Class B',
      'Suruhanjaya Tenaga Electrical Contractor Class C',
      'Suruhanjaya Tenaga Electrical Contractor Class D'
    ]
  },
  {
    category: 'Water & Sewerage',
    items: [
      'SPAN Permit Kelas A',
      'SPAN Permit Kelas B',
      'SPAN Permit Kelas C'
    ]
  },
  {
    category: 'Telecom / ICT',
    items: [
      'MCMC Network Facility Provider Licence',
      'MCMC Service Provider Licence'
    ]
  },
  {
    category: 'Management Systems',
    items: [
      'ISO 9001:2015 (Quality Management)',
      'ISO 14001:2015 (Environmental Management)',
      'ISO 45001:2018 (Occupational Health & Safety)',
      'ISO 37001:2016 (Anti-Bribery Management)',
      'ISO/IEC 27001:2013 (Information Security)'
    ]
  },
  {
    category: 'Lab & Testing',
    items: [
      'ISO/IEC 17025:2017 (Testing and Calibration Laboratories)'
    ]
  },
  {
    category: 'ASEAN Expansion',
    items: [
      'BCA Workhead & Grade (Singapore)',
      'PCAB Category AAA (Philippines)',
      'PCAB Category A (Philippines)',
      'PCAB Category B (Philippines)',
      'PCAB Category C (Philippines)'
    ]
  },
  {
    category: 'Miscellaneous',
    items: [
      'DOSH CIDB Green Card',
      'Safety Passport',
      'SST Compliance Letter',
      'GST Compliance Letter'
    ]
  }
];

export default function CertificationsList({ 
  customCertifications = [], 
  onCertificationsChange,
  readOnly = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    number: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    documents: []
  });

  // Filter certifications based on search and category
  const filteredCertifications = MALAYSIA_CERTIFICATIONS.filter(category => {
    if (selectedCategory !== 'all' && category.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      return category.items.some(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const categories = ['all', ...MALAYSIA_CERTIFICATIONS.map(cat => cat.category)];

  // Add certification from master list
  const addFromMasterList = (certificationName) => {
    const newCert = {
      id: Date.now(),
      name: certificationName,
      number: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      documents: [],
      status: 'pending'
    };
    
    onCertificationsChange([...customCertifications, newCert]);
  };

  // Add custom certification
  const addCustomCertification = () => {
    if (!newCertification.name.trim()) return;
    
    const cert = {
      id: Date.now(),
      ...newCertification,
      status: 'pending'
    };
    
    onCertificationsChange([...customCertifications, cert]);
    setNewCertification({
      name: '',
      number: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      documents: []
    });
    setShowAddForm(false);
  };

  // Remove certification
  const removeCertification = (id) => {
    onCertificationsChange(customCertifications.filter(cert => cert.id !== id));
  };

  // Update certification
  const updateCertification = (id, updates) => {
    onCertificationsChange(
      customCertifications.map(cert => 
        cert.id === id ? { ...cert, ...updates } : cert
      )
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Check if certification is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow && expiry > now;
  };

  // Check if certification is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Current Certifications */}
      {customCertifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Your Certifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customCertifications.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      {cert.number && (
                        <p className="text-sm text-gray-600">Number: {cert.number}</p>
                      )}
                      {cert.issuer && (
                        <p className="text-sm text-gray-600">Issuer: {cert.issuer}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(cert.status)}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(cert.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {cert.issueDate && (
                      <div>
                        <label className="text-xs text-gray-500">Issue Date</label>
                        <p className="text-sm">{new Date(cert.issueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {cert.expiryDate && (
                      <div>
                        <label className="text-xs text-gray-500">Expiry Date</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm">{new Date(cert.expiryDate).toLocaleDateString()}</p>
                          {isExpired(cert.expiryDate) && (
                            <Badge className="bg-red-100 text-red-800">Expired</Badge>
                          )}
                          {isExpiringSoon(cert.expiryDate) && !isExpired(cert.expiryDate) && (
                            <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document upload area */}
                  {!readOnly && (
                    <div className="border-t border-gray-100 pt-3">
                      <label className="text-xs text-gray-500 mb-2 block">Supporting Documents</label>
                      <FileUploader
                        onFileUpload={(file) => {
                          const updatedDocs = [...(cert.documents || []), file];
                          updateCertification(cert.id, { documents: updatedDocs });
                        }}
                        acceptedTypes=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        existingFiles={cert.documents || []}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Certifications */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search certifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Master List */}
            <div className="space-y-4 mb-6">
              {filteredCertifications.map((category) => (
                <div key={category.category}>
                  <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.items
                      .filter(item => !searchTerm || item.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item) => {
                        const alreadyAdded = customCertifications.some(cert => cert.name === item);
                        return (
                          <div
                            key={item}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              alreadyAdded ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <span className={`text-sm ${alreadyAdded ? 'text-gray-500' : 'text-gray-900'}`}>
                              {item}
                            </span>
                            <Button
                              size="sm"
                              variant={alreadyAdded ? "ghost" : "outline"}
                              onClick={() => addFromMasterList(item)}
                              disabled={alreadyAdded}
                            >
                              {alreadyAdded ? 'Added' : 'Add'}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Certification Form */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Add Custom Certification</h4>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </div>

              {showAddForm && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certification Name *
                      </label>
                      <Input
                        value={newCertification.name}
                        onChange={(e) => setNewCertification({
                          ...newCertification,
                          name: e.target.value
                        })}
                        placeholder="Enter certification name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Number
                      </label>
                      <Input
                        value={newCertification.number}
                        onChange={(e) => setNewCertification({
                          ...newCertification,
                          number: e.target.value
                        })}
                        placeholder="Certificate number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issuing Authority
                      </label>
                      <Input
                        value={newCertification.issuer}
                        onChange={(e) => setNewCertification({
                          ...newCertification,
                          issuer: e.target.value
                        })}
                        placeholder="e.g., CIDB Malaysia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <Input
                        type="date"
                        value={newCertification.issueDate}
                        onChange={(e) => setNewCertification({
                          ...newCertification,
                          issueDate: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        value={newCertification.expiryDate}
                        onChange={(e) => setNewCertification({
                          ...newCertification,
                          expiryDate: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addCustomCertification}
                      disabled={!newCertification.name.trim()}
                    >
                      Add Certification
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}