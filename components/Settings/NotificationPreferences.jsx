// components/Settings/NotificationPreferences.jsx
// Notification preferences settings component using existing Tenderly styling
// Manages user notification preferences for tenders and proposals

import React, { useState } from 'react';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';

export default function NotificationPreferences() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Notification preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      newTenders: true,
      proposalUpdates: true,
      deadlineReminders: true,
      marketingEmails: false
    },
    pushNotifications: {
      newTenders: true,
      proposalUpdates: true,
      deadlineReminders: true,
      systemUpdates: false
    },
    smsNotifications: {
      urgentUpdates: true,
      deadlineReminders: false
    }
  });

  // Handle email notification changes
  const handleEmailChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: value
      }
    }));
  };

  // Handle push notification changes
  const handlePushChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: value
      }
    }));
  };

  // Handle SMS notification changes
  const handleSmsChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      smsNotifications: {
        ...prev.smsNotifications,
        [key]: value
      }
    }));
  };

  // Save notification preferences
  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real app, this would call an API endpoint to save preferences
      // await api('/api/user/notifications', { method: 'PUT', body: preferences });
      addToast('Notification preferences saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save notification preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <p className="text-gray-600 mb-6">
          Choose how you want to be notified about tender opportunities and updates.
        </p>
      </div>

      {/* Email Notifications */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <EnvelopeIcon className="h-5 w-5 text-primary" />
          <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
        </div>
        
        <div className="space-y-3 ml-7">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.newTenders}
              onChange={(e) => handleEmailChange('newTenders', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">New tender opportunities matching your criteria</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.proposalUpdates}
              onChange={(e) => handleEmailChange('proposalUpdates', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Proposal status updates</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.deadlineReminders}
              onChange={(e) => handleEmailChange('deadlineReminders', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Deadline reminders</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.marketingEmails}
              onChange={(e) => handleEmailChange('marketingEmails', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Marketing emails and product updates</span>
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <BellIcon className="h-5 w-5 text-secondary" />
          <h4 className="text-md font-medium text-gray-900">Push Notifications</h4>
        </div>
        
        <div className="space-y-3 ml-7">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.pushNotifications.newTenders}
              onChange={(e) => handlePushChange('newTenders', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">New tender opportunities</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.pushNotifications.proposalUpdates}
              onChange={(e) => handlePushChange('proposalUpdates', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Proposal status changes</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.pushNotifications.deadlineReminders}
              onChange={(e) => handlePushChange('deadlineReminders', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Deadline reminders</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.pushNotifications.systemUpdates}
              onChange={(e) => handlePushChange('systemUpdates', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">System maintenance and updates</span>
          </label>
        </div>
      </div>

      {/* SMS Notifications */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <DevicePhoneMobileIcon className="h-5 w-5 text-accent" />
          <h4 className="text-md font-medium text-gray-900">SMS Notifications</h4>
        </div>
        
        <div className="space-y-3 ml-7">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.smsNotifications.urgentUpdates}
              onChange={(e) => handleSmsChange('urgentUpdates', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">Urgent proposal updates</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.smsNotifications.deadlineReminders}
              onChange={(e) => handleSmsChange('deadlineReminders', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-700">24-hour deadline reminders</span>
          </label>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}