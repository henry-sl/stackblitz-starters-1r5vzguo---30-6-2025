// components/ProfileForm.jsx
// This component provides a form for viewing and updating the company profile
// It fetches the current profile data and allows the user to edit and save changes
// Enhanced with client-side validation, better error handling, and data sanitization

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';

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

export default function ProfileForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [saving, setSaving] = useState(false); // Loading state for save operation
  const [validationErrors, setValidationErrors] = useState({}); // Client-side validation errors
  
  // Form data state with default empty values
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    certifications: '',
    experience: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  // Load company profile data when component mounts
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Function to fetch company profile data from the API
  const loadCompanyData = async () => {
    try {
      console.log('[ProfileForm] Loading company data');
      const data = await api('/api/company');
      console.log('[ProfileForm] Company data loaded:', data);
      
      setFormData({
        name: data.name || '',
        registrationNumber: data.registrationNumber || '',
        certifications: data.certifications?.join(', ') || '',
        experience: sanitizeExperienceText(data.experience) || '', // Sanitize on load
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('[ProfileForm] Error loading company data:', error);
      // Company profile might not exist yet - this is normal for new users
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log('[ProfileForm] No existing profile found - this is normal for new users');
      } else {
        addToast('Failed to load company profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation function
  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Company name is required';
    }
    
    // Email validation
    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      }
    }
    
    // Phone validation (basic)
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(formData.contactPhone)) {
        errors.contactPhone = 'Please enter a valid phone number';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission to update the company profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('[ProfileForm] Form submission started');
    console.log('[ProfileForm] Form data:', formData);
    
    // Client-side validation
    if (!validateForm()) {
      console.log('[ProfileForm] Client-side validation failed:', validationErrors);
      addToast('Please fix the validation errors before submitting', 'error');
      return;
    }
    
    try {
      setSaving(true);
      console.log('[ProfileForm] Sending update request');
      
      const updateData = {
        ...formData,
        // Sanitize experience text before sending
        experience: sanitizeExperienceText(formData.experience),
        // Convert comma-separated certifications string to array
        certifications: formData.certifications 
          ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean)
          : []
      };
      
      console.log('[ProfileForm] Update data prepared:', updateData);
      
      await api('/api/company', {
        method: 'PUT',
        body: updateData
      });
      
      console.log('[ProfileForm] Profile updated successfully');
      addToast('Company profile updated successfully!', 'success');
      
      // Clear validation errors on successful save
      setValidationErrors({});
      
    } catch (error) {
      console.error('[ProfileForm] Error updating profile:', error);
      
      // Handle specific error types
      if (error.message.includes('400')) {
        addToast('Please check your input and try again', 'error');
      } else if (error.message.includes('401')) {
        addToast('Authentication error. Please log in again.', 'error');
      } else if (error.message.includes('500')) {
        addToast('Server error. Please try again later.', 'error');
      } else {
        addToast('Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize experience field in real-time
    const sanitizedValue = name === 'experience' ? sanitizeExperienceText(value) : value;
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  // Calculate profile completeness percentage
  const calculateCompleteness = () => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="card">
        <div className="space-y-4">
          <div className="skeleton h-6 w-1/4"></div>
          <div className="skeleton h-10 w-full"></div>
          <div className="skeleton h-10 w-full"></div>
          <div className="skeleton h-20 w-full"></div>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
        
        {/* Profile Completeness Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Profile Completeness</span>
            <span>{completeness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Company Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your company name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Registration Number */}
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="e.g., 123456-A"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                validationErrors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="company@example.com"
            />
            {validationErrors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contactEmail}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                validationErrors.contactPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+60-3-1234-5678"
            />
            {validationErrors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contactPhone}</p>
            )}
          </div>
        </div>

        {/* Business Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Enter your complete business address"
          />
        </div>

        {/* Certifications */}
        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (comma-separated)
          </label>
          <input
            type="text"
            id="certifications"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            placeholder="ISO 9001, ISO 14001, OHSAS 18001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate multiple certifications with commas
          </p>
        </div>

        {/* Company Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Company Experience & Capabilities
          </label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows={6}
            placeholder="Describe your company's experience, key projects, capabilities, and expertise..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-sm text-gray-500">
            This information will be used for Quick Insert in proposals
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || Object.keys(validationErrors).length > 0}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}