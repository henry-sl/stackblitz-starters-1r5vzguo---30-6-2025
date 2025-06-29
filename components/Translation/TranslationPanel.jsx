// components/Translation/TranslationPanel.jsx
// Side-by-side translation panel for proposal editing
// Allows users to work with both English and Malay versions

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Languages, Copy, Download, RefreshCw, ArrowLeftRight } from 'lucide-react';

export default function TranslationPanel({ 
  originalContent, 
  onTranslatedContentChange,
  originalLanguage = 'en',
  className = ''
}) {
  const { addToast } = useToast();
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTargetLang, setCurrentTargetLang] = useState(originalLanguage === 'en' ? 'ms' : 'en');

  const handleTranslate = async () => {
    if (!originalContent || !originalContent.trim()) {
      addToast('No content to translate', 'error');
      return;
    }

    try {
      setIsTranslating(true);
      
      const result = await api('/api/translate', {
        method: 'POST',
        body: { 
          text: originalContent.trim(), 
          targetLang: currentTargetLang,
          sourceLang: originalLanguage
        }
      });

      setTranslatedContent(result.translatedText);
      if (onTranslatedContentChange) {
        onTranslatedContentChange(result.translatedText);
      }
      addToast('Translation completed successfully!', 'success');
    } catch (error) {
      console.error('Translation error:', error);
      addToast('Translation failed: ' + error.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyTranslation = async () => {
    if (!translatedContent) return;
    
    try {
      await navigator.clipboard.writeText(translatedContent);
      addToast('Translation copied to clipboard', 'success');
    } catch (error) {
      addToast('Failed to copy translation', 'error');
    }
  };

  const handleSwapLanguages = () => {
    setCurrentTargetLang(currentTargetLang === 'en' ? 'ms' : 'en');
    setTranslatedContent(''); // Clear previous translation
  };

  const downloadTranslation = () => {
    if (!translatedContent) return;
    
    const blob = new Blob([translatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal_${currentTargetLang}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Translation downloaded', 'success');
  };

  const getLanguageName = (lang) => {
    return lang === 'ms' ? 'Bahasa Malaysia' : 'English';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Translation Panel</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSwapLanguages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !originalContent?.trim()}
              className="btn btn-primary"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-2" />
                  Translate to {getLanguageName(currentTargetLang)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Original Content */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Original ({getLanguageName(originalLanguage)})
            </h4>
            <span className="text-xs text-gray-500">
              {originalContent?.length || 0} characters
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 h-64 overflow-y-auto">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {originalContent || 'No content to translate'}
            </div>
          </div>
        </div>

        {/* Translated Content */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Translation ({getLanguageName(currentTargetLang)})
            </h4>
            <div className="flex items-center space-x-2">
              {translatedContent && (
                <>
                  <span className="text-xs text-gray-500">
                    {translatedContent.length} characters
                  </span>
                  <button
                    onClick={handleCopyTranslation}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    title="Copy translation"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={downloadTranslation}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    title="Download translation"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 h-64 overflow-y-auto">
            {translatedContent ? (
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {translatedContent}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Click "Translate" to see the {getLanguageName(currentTargetLang)} version
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Official tender submissions in Malaysia must be in Bahasa Malaysia. 
          Use this tool to translate your English proposals or to understand Malay tender documents.
        </p>
      </div>
    </div>
  );
}