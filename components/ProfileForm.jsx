// components/ProfileForm.jsx
// This component provides a form for viewing and updating the company profile
// Updated to work with Supabase backend and nested profile structure

import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function ProfileForm() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [saving, setSaving] = useState(false); // Loading state for save operation
  
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
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  // Function to fetch company profile data from the API
  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast('Please log in to view your profile', 'error');
        return;
      }

      // Fetch profile data from API
      const response = await fetch('/api/company', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const nestedProfile = await response.json();
      
      // Map nested structure to flat formData structure
      setFormData({
        name: nestedProfile.basicInfo?.companyName || '',
        registrationNumber: nestedProfile.basicInfo?.registrationNumber || '',
        certifications: nestedProfile.certifications ? 
          Object.entries(nestedProfile.certifications)
            .filter(([key, value]) => typeof value === 'boolean' && value)
            .map(([key]) => key)
            .join(', ') : '',
        experience: nestedProfile.experience?.yearsInOperation || '',
        contactEmail: nestedProfile.basicInfo?.email || '',
        contactPhone: nestedProfile.basicInfo?.phone || '',
        address: nestedProfile.basicInfo?.address || ''
      });
    } catch (error) {
      console.error('Error loading company data:', error);
      addToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to update the company profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast('Please log in to save your profile', 'error');
        return;
      }

      // Transform flat formData to nested structure expected by API
      const nestedProfile = {
        basicInfo: {
          companyName: formData.name,
          registrationNumber: formData.registrationNumber,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          address: formData.address,
          website: '',
          establishedYear: ''
        },
        certifications: {
          cidbGrade: '',
          cidbExpiry: '',
          iso9001: formData.certifications.toLowerCase().includes('iso9001') || formData.certifications.toLowerCase().includes('iso 9001'),
          iso14001: formData.certifications.toLowerCase().includes('iso14001') || formData.certifications.toLowerCase().includes('iso 14001'),
          ohsas18001: formData.certifications.toLowerCase().includes('ohsas18001') || formData.certifications.toLowerCase().includes('ohsas 18001'),
          contractorLicense: '',
          licenseExpiry: ''
        },
        experience: {
          yearsInOperation: formData.experience,
          totalProjects: '',
          totalValue: '',
          specialties: [],
          majorProjects: []
        },
        team: {
          totalEmployees: '',
          engineers: '',
          supervisors: '',
          technicians: '',
          laborers: '',
          keyPersonnel: []
        },
        preferences: {
          categories: [],
          locations: [],
          budgetRange: ''
        }
      };

      // Send to API
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nestedProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      addToast('Company profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate profile completeness percentage
  const calculateCompleteness = () => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field.trim() !== '').length;
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
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
        </div>

        {/* Company Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="text"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g., 8 years"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}