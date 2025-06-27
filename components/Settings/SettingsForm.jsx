// components/Settings/SettingsForm.jsx
// Main settings form with tabbed sections that integrates with existing Tenderly styling
// Provides navigation between different settings categories

import React, { useState } from 'react';
import NotificationPreferences from './NotificationPreferences';
import SecuritySettings from './SecuritySettings';
import ContactUpdate from './ContactUpdate';

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState('contact');

  const tabs = [
    { id: 'contact', label: 'Contact Info' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="card">
      {/* Tab navigation using existing Tenderly styling */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Settings sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'contact' && <ContactUpdate />}
        {activeTab === 'notifications' && <NotificationPreferences />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
}