// components/Settings/SettingsPage.jsx
// This page provides a comprehensive settings interface for user preferences and account management
// It integrates with the existing Tenderly application structure and styling

import React from 'react';
import SettingsForm from './SettingsForm';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account preferences and notification settings
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}