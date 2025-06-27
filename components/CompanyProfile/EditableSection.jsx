// components/CompanyProfile/EditableSection.jsx
// Section wrapper for editable company profile fields
// Groups related fields together with consistent styling

import React from 'react';
import InlineEdit from './InlineEdit';

export default function EditableSection({ title, icon: Icon, children, fields, onFieldSave }) {
  return (
    <div className="card mb-6">
      <div className="flex items-center space-x-2 mb-6">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {fields && fields.map((field) => (
          <InlineEdit
            key={field.key}
            label={field.label}
            value={field.value}
            placeholder={field.placeholder}
            multiline={field.multiline}
            required={field.required}
            onSave={(value) => onFieldSave(field.key, value)}
          />
        ))}
        {children}
      </div>
    </div>
  );
}