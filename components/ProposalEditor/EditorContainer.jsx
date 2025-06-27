// components/ProposalEditor/EditorContainer.jsx
// Main container component for the proposal editor
// Orchestrates all editor components and manages state

import React, { useState, useEffect, useCallback } from 'react';
import AutosaveIndicator from './AutosaveIndicator';
import ToolbarSection from './ToolbarSection';
import ContentArea from './ContentArea';
import ExportControls from './ExportControls';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';

export default function EditorContainer({ 
  proposalId, 
  initialContent = '', 
  proposalTitle = "Untitled Proposal",
  readOnly = false 
}) {
  const { addToast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Autosave functionality
  const saveContent = useCallback(async () => {
    if (!proposalId || readOnly || !hasUnsavedChanges) return;

    try {
      setSaveStatus('saving');
      
      await api('/api/saveDraft', {
        method: 'POST',
        body: { proposalId, content }
      });
      
      setSaveStatus('saved');
      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
    } catch (error) {
      setSaveStatus('error');
      console.error('Autosave failed:', error);
    }
  }, [proposalId, content, readOnly, hasUnsavedChanges]);

  // Autosave timer
  useEffect(() => {
    if (!hasUnsavedChanges || readOnly) return;

    const timer = setTimeout(() => {
      saveContent();
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, saveContent, readOnly]);

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    setSaveStatus('saving');
  };

  // Handle formatting commands
  const handleFormat = (action, value) => {
    // This would implement rich text formatting
    // For now, we'll just add simple markdown-style formatting
    
    switch (action) {
      case 'bold':
        insertFormatting('**', '**');
        break;
      case 'italic':
        insertFormatting('*', '*');
        break;
      case 'bulletList':
        insertFormatting('\n• ');
        break;
      case 'numberedList':
        insertFormatting('\n1. ');
        break;
      case 'heading':
        if (value === 'heading1') insertFormatting('# ');
        else if (value === 'heading2') insertFormatting('## ');
        else if (value === 'heading3') insertFormatting('### ');
        break;
      default:
        console.log('Format action not implemented:', action);
    }
  };

  // Insert formatting at cursor position
  const insertFormatting = (before, after = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    handleContentChange(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Manual save
  const handleManualSave = () => {
    saveContent();
    addToast('Proposal saved successfully!', 'success');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">{proposalTitle}</h2>
          {!readOnly && (
            <AutosaveIndicator status={saveStatus} lastSaved={lastSaved} />
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!readOnly && (
            <button
              onClick={handleManualSave}
              disabled={!hasUnsavedChanges}
              className="btn btn-secondary text-sm"
            >
              Save Now
            </button>
          )}
          <ExportControls content={content} proposalTitle={proposalTitle} />
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <ToolbarSection onFormat={handleFormat} disabled={readOnly} />
      )}

      {/* Content Area */}
      <ContentArea
        content={content}
        onChange={handleContentChange}
        readOnly={readOnly}
        placeholder="Start writing your proposal..."
      />
    </div>
  );
}