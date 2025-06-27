// pages/company-profile.js
// Enhanced company profile page with comprehensive profile management
// Includes editable sections, document management, and validation status

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { api } from '../lib/api';
import ProfileHeader from '../components/CompanyProfile/ProfileHeader';
import EditableSection from '../components/CompanyProfile/EditableSection';
import ComplianceDocuments from '../components/CompanyProfile/ComplianceDocuments';
import ValidationStatus from '../components/CompanyProfile/ValidationStatus';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  IdentificationIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState({});

  // Load company data when component mounts
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Function to fetch company profile data from API
  const loadCompanyData = async () => {
    try {
      const data = await api('/api/company');
      setCompanyData(data);
    } catch (error) {
      // Company profile might not exist yet
      setCompanyData({});
    } finally {
      setLoading(false);
    }
  };

  // Handle field updates
  const handleFieldSave = async (field, value) => {
    try {
      const updatedData = { ...companyData, [field]: value };
      await api('/api/company', {
        method: 'PUT',
        body: updatedData
      });
      setCompanyData(updatedData);
      addToast('Field updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update field', 'error');
      throw error;
    }
  };

  // Calculate profile completion percentage
  const calculateCompleteness = () => {
    const fields = [
      'name', 'registrationNumber', 'contactEmail', 'contactPhone', 
      'address', 'experience', 'certifications'
    ];
    const filledFields = fields.filter(field => {
      const value = companyData[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
    }).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-32 w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-64 w-full"></div>
            <div className="skeleton h-64 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateCompleteness();

  // Define editable sections
  const basicInfoFields = [
    {
      key: 'name',
      label: 'Company Name',
      value: companyData.name,
      placeholder: 'Enter your company name',
      required: true
    },
    {
      key: 'registrationNumber',
      label: 'Registration Number',
      value: companyData.registrationNumber,
      placeholder: 'Enter registration number'
    }
  ];

  const contactFields = [
    {
      key: 'contactEmail',
      label: 'Contact Email',
      value: companyData.contactEmail,
      placeholder: 'Enter contact email'
    },
    {
      key: 'contactPhone',
      label: 'Contact Phone',
      value: companyData.contactPhone,
      placeholder: 'Enter contact phone number'
    },
    {
      key: 'address',
      label: 'Business Address',
      value: companyData.address,
      placeholder: 'Enter complete business address',
      multiline: true
    }
  ];

  const experienceFields = [
    {
      key: 'experience',
      label: 'Company Experience & Capabilities',
      value: companyData.experience,
      placeholder: 'Describe your company\'s experience, key projects, capabilities, and expertise...',
      multiline: true
    }
  ];

  const certificationFields = [
    {
      key: 'certifications',
      label: 'Certifications (comma-separated)',
      value: Array.isArray(companyData.certifications) 
        ? companyData.certifications.join(', ') 
        : companyData.certifications,
      placeholder: 'ISO 9001, ISO 14001, OHSAS 18001'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your company information, documents, and compliance status.
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader 
        companyData={companyData} 
        completionPercentage={completionPercentage} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <EditableSection
            title="Basic Information"
            icon={BuildingOfficeIcon}
            fields={basicInfoFields}
            onFieldSave={handleFieldSave}
          />

          {/* Contact Information */}
          <EditableSection
            title="Contact Information"
            icon={EnvelopeIcon}
            fields={contactFields}
            onFieldSave={handleFieldSave}
          />

          {/* Experience */}
          <EditableSection
            title="Experience & Capabilities"
            icon={IdentificationIcon}
            fields={experienceFields}
            onFieldSave={handleFieldSave}
          />

          {/* Certifications */}
          <EditableSection
            title="Certifications"
            icon={AcademicCapIcon}
            fields={certificationFields}
            onFieldSave={(field, value) => {
              // Convert comma-separated string to array for certifications
              const processedValue = field === 'certifications' 
                ? value.split(',').map(c => c.trim()).filter(Boolean)
                : value;
              return handleFieldSave(field, processedValue);
            }}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Validation Status */}
          <ValidationStatus companyData={companyData} />

          {/* Compliance Documents */}
          <ComplianceDocuments />
        </div>
      </div>
    </div>
  );
}