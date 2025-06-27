// components/ProposalEditor/ToolbarSection.jsx
// Toolbar with formatting controls for the proposal editor
// Provides text formatting, lists, and document structure tools

import React from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

export default function ToolbarSection({ onFormat, disabled = false }) {
  const toolbarButtons = [
    {
      group: 'text',
      buttons: [
        { icon: BoldIcon, action: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: ItalicIcon, action: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: UnderlineIcon, action: 'underline', title: 'Underline (Ctrl+U)' }
      ]
    },
    {
      group: 'lists',
      buttons: [
        { icon: ListBulletIcon, action: 'bulletList', title: 'Bullet List' },
        { icon: NumberedListIcon, action: 'numberedList', title: 'Numbered List' }
      ]
    },
    {
      group: 'insert',
      buttons: [
        { icon: LinkIcon, action: 'link', title: 'Insert Link' },
        { icon: PhotoIcon, action: 'image', title: 'Insert Image' },
        { icon: TableCellsIcon, action: 'table', title: 'Insert Table' }
      ]
    }
  ];

  const headingOptions = [
    { value: 'paragraph', label: 'Normal Text' },
    { value: 'heading1', label: 'Heading 1' },
    { value: 'heading2', label: 'Heading 2' },
    { value: 'heading3', label: 'Heading 3' }
  ];

  const handleButtonClick = (action) => {
    if (disabled) return;
    onFormat(action);
  };

  const handleHeadingChange = (e) => {
    if (disabled) return;
    onFormat('heading', e.target.value);
  };

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex items-center space-x-4">
        {/* Heading Selector */}
        <select
          onChange={handleHeadingChange}
          disabled={disabled}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
        >
          {headingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Toolbar Button Groups */}
        {toolbarButtons.map((group, groupIndex) => (
          <div key={group.group} className="flex items-center space-x-1">
            {groupIndex > 0 && <div className="w-px h-6 bg-gray-300 mx-2" />}
            {group.buttons.map((button) => {
              const IconComponent = button.icon;
              return (
                <button
                  key={button.action}
                  onClick={() => handleButtonClick(button.action)}
                  disabled={disabled}
                  title={button.title}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        ))}

        {/* Word Count */}
        <div className="ml-auto text-sm text-gray-500">
          <span>0 words</span>
        </div>
      </div>
    </div>
  );
}