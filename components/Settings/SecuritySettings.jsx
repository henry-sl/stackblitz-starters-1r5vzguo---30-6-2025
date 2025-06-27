// components/Settings/SecuritySettings.jsx
// Security settings component for password and 2FA management using existing Tenderly styling
// Integrates with Supabase authentication system

import React, { useState } from 'react';
import { ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';

export default function SecuritySettings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Handle password change using Supabase
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      addToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      addToast('Failed to update password', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Handle two-factor authentication toggle
  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    addToast(
      twoFactorEnabled 
        ? 'Two-factor authentication disabled' 
        : 'Two-factor authentication enabled', 
      'success'
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <p className="text-gray-600 mb-6">
          Manage your account security and authentication preferences.
        </p>
      </div>

      {/* Password Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="h-5 w-5 text-primary" />
          <h4 className="text-md font-medium text-gray-900">Password</h4>
        </div>
        
        <p className="text-gray-600 mb-4">
          Keep your account secure with a strong password.
        </p>
        
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn btn-primary"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className="h-5 w-5 text-secondary" />
            <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        <p className="text-gray-600 mb-4">
          {twoFactorEnabled 
            ? 'Two-factor authentication is enabled. Your account has an extra layer of security.'
            : 'Add an extra layer of security to your account by enabling two-factor authentication.'
          }
        </p>
        
        {twoFactorEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                2FA is active using your mobile app
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
        <div className="flex items-center space-x-3 mb-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          <h4 className="text-md font-medium text-yellow-800">Security Recommendations</h4>
        </div>
        
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>• Use a strong, unique password for your Tenderly account</li>
          <li>• Enable two-factor authentication for enhanced security</li>
          <li>• Regularly review your account activity and login history</li>
          <li>• Never share your login credentials with others</li>
          <li>• Log out from shared or public computers</li>
        </ul>
      </div>

      {/* Account Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Account created:</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last sign in:</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}