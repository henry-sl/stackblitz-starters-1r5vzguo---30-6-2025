// components/Settings/ContactUpdate.jsx
// Contact information update component that integrates with existing company profile API
// Uses the same backend endpoints as the existing ProfileForm component with data sanitization

import React, { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';

// Helper function to sanitize experience text
const sanitizeExperienceText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove common placeholder text patterns
  const placeholderPatterns = [
    /You can enter this information into the fields\s*\.?\s*/gi,
    /\*\*Company Background:\*\*\s*/gi,
    /\*\*Certifications:\*\*\s*/gi,
    /\*\*Company Experience:\*\*\s*/gi,
    /\*\*Experience:\*\*\s*/gi,
    /Please complete your profile first\s*\.?\s*/gi,
    /Enter your company information here\s*\.?\s*/gi,
    /Add your company details\s*\.?\s*/gi,
    /Complete your company profile\s*\.?\s*/gi,
    // Remove duplicate company name patterns
    /^([^.]+)\s+is\s+\1\s+/gi,
    // Remove excessive whitespace and newlines
    /\n\s*\n\s*\n/g,
    /\s{3,}/g
  ];
  
  let cleanedText = text;
  
  // Apply all sanitization patterns
  placeholderPatterns.forEach(pattern => {
    if (pattern.toString().includes('\\n')) {
      cleanedText = cleanedText.replace(pattern, '\n\n');
    } else {
      cleanedText = cleanedText.replace(pattern, ' ');
    }
  });
  
  // Clean up extra whitespace and normalize
  cleanedText = cleanedText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
  
  return cleanedText;
};

export default function ContactUpdate() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form data state matching existing company profile structure
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    registrationNumber: '',
    experience: ''
  });

  // Load existing company data when component mounts
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Function to fetch company profile data from existing API
  const loadCompanyData = async () => {
    try {
      const data = await api('/api/company');
      setFormData({
        name: data.name || '',
        contactEmail: data.contactEmail || user?.email || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        registrationNumber: data.registrationNumber || '',
        experience: sanitizeExperienceText(data.experience) || '' // Sanitize on load
      });
    } catch (error) {
      // Company profile might not exist yet, use defaults
      setFormData(prev => ({
        ...prev,
        contactEmail: user?.email || ''
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission using existing company API endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Sanitize experience text before sending
      const sanitizedFormData = {
        ...formData,
        experience: sanitizeExperienceText(formData.experience)
      };
      
      await api('/api/company', {
        method: 'PUT',
        body: sanitizedFormData
      });
      addToast('Contact information updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update contact information', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle input field changes
  const handleChange = (field, value) => {
    // Sanitize experience field in real-time
    const sanitizedValue = field === 'experience' ? sanitizeExperienceText(value) : value;
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-1/4"></div>
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-20 w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <p className="text-gray-600 mb-6">
          Update your contact details and ensure your information is current.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-4 w-4 mr-2" />
            Company Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Contact Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2" />
            Business Address
          </h4>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Complete Business Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Enter your complete business address"
            />
          </div>
        </div>

        {/* Company Experience */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Company Experience</h4>
          
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Company Experience & Capabilities
            </label>
            <textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Describe your company's experience, key projects, capabilities, and expertise..."
            />
            <p className="mt-1 text-sm text-gray-500">
              This information will be used for Quick Insert in proposals
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}