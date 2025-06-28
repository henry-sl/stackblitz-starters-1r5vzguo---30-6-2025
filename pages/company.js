// pages/company.js
// This page displays and allows editing of the company profile
// It uses the CompanyProfile component to handle the form functionality

import { CompanyProfile } from '../components/CompanyProfile/CompanyProfile';

export default function CompanyProfilePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CompanyProfile />
    </div>
  );
}