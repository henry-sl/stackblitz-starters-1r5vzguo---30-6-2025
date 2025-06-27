// components/ProposalEditor.jsx
// This component provides a rich text editor for creating and editing proposals
// It includes formatting buttons and a textarea for content

import { useState, useRef } from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon,
  HashtagIcon 
} from '@heroicons/react/24/outline';

export default function ProposalEditor({ content, onChange, readOnly = false }) {
  const textareaRef = useRef(null);

  // Function to insert text at the current cursor position
  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Formatting functions
  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatBullet = () => insertText('\n• ');
  const formatHeading = () => insertText('## ');

  return (
    <div className="card">
      {/* Formatting toolbar - only shown in edit mode */}
      {!readOnly && (
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
          <button
            type="button"
            onClick={formatBold}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Bold"
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={formatItalic}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Italic"
          >
            <ItalicIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={formatBullet}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Bullet List"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={formatHeading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Heading"
          >
            <HashtagIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Textarea for editing proposal content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Start writing your proposal..."
        className={`w-full min-h-96 p-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary resize-none ${
          readOnly ? 'bg-gray-50' : ''
        }`}
        style={{ height: 'auto', minHeight: '400px' }}
      />
    </div>
  );
}