// pages/company.js
// This page displays and allows editing of the company profile
// It uses the ProfileForm component to handle the form functionality

import ProfileForm from '../components/ProfileForm';

export default function CompanyProfile() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="mt-2 text-gray-600">
          Complete your company profile to improve your tender eligibility and credibility.
        </p>
      </div>
      
      {/* Render the profile form component */}
      <ProfileForm />
    </div>
  );
}