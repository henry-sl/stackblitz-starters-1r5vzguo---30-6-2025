// components/CompanyProfile/InlineEdit.jsx
// Reusable inline editing component for company profile fields
// Allows users to edit fields directly without separate forms

import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function InlineEdit({ 
  value, 
  onSave, 
  placeholder = "Click to add...", 
  multiline = false,
  label,
  required = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (required && !editValue.trim()) {
      return;
    }
    
    try {
      setSaving(true);
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="flex items-start space-x-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              rows={3}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder={placeholder}
            />
          )}
          <div className="flex space-x-1">
            <button
              onClick={handleSave}
              disabled={saving || (required && !editValue.trim())}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div 
        className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer group-hover:bg-gray-50"
        onClick={() => setIsEditing(true)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <PencilIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}