// components/ProposalEditor/ContentArea.jsx
// Main content editing area for proposals with rich text capabilities
// Handles text input, formatting, and content management

import React, { useRef, useEffect } from 'react';

export default function ContentArea({ 
  content, 
  onChange, 
  onSelectionChange,
  readOnly = false,
  placeholder = "Start writing your proposal..."
}) {
  const editorRef = useRef(null);

  // Handle content changes
  const handleInput = (e) => {
    if (readOnly) return;
    onChange(e.target.value);
  };

  // Handle selection changes for toolbar state
  const handleSelectionChange = () => {
    if (onSelectionChange) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      onSelectionChange(selection, range);
    }
  };

  // Focus editor on mount
  useEffect(() => {
    if (!readOnly && editorRef.current) {
      editorRef.current.focus();
    }
  }, [readOnly]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (readOnly) return;

    // Ctrl+S for save (prevent default browser save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Trigger save through parent component
      return;
    }

    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '    ' + content.substring(end);
      onChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Editor Area */}
      <div className="flex-1 relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleInput}
          onSelect={handleSelectionChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full h-full p-6 border-0 resize-none focus:outline-none text-gray-900 leading-relaxed ${
            readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'
          }`}
          style={{ 
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
        
        {/* Character/Word Count */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
          {content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-6 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between">
        <span>
          {readOnly ? 'Read-only mode' : 'Editing mode'}
        </span>
        <span>
          Line {content.substring(0, editorRef.current?.selectionStart || 0).split('\n').length}
        </span>
      </div>
    </div>
  );
}