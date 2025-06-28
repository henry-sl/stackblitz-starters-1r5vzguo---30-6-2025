// components/ProfileForm.jsx
// This component provides a form for viewing and updating the company profile
// It fetches the current profile data and allows the user to edit and save changes

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';

export default function ProfileForm() {
  const { addToast } = useToast();
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
    loadCompanyData();
  }, []);

  // Function to fetch company profile data from the API
  const loadCompanyData = async () => {
    try {
      const data = await api('/api/company');
      setFormData({
        name: data.name || '',
        registrationNumber: data.registrationNumber || '',
        certifications: data.certifications?.join(', ') || '',
        experience: data.experience || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || ''
      });
    } catch (error) {
      // Company profile might not exist yet
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to update the company profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api('/api/company', {
        method: 'PUT',
        body: {
          ...formData,
          // Convert comma-separated certifications string to array
          certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean)
        }
      });
      addToast('Company profile updated successfully!', 'success');
    } catch (error) {
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