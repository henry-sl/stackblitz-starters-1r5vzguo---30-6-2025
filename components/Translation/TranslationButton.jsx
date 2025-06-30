// components/Translation/TranslationButton.jsx
// Reusable translation button component
// Handles translation requests and displays results

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Languages, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function TranslationButton({ 
  text, 
  targetLang, 
  buttonText, 
  className = '',
  variant = 'outline',
  size = 'sm'
}) {
  const { addToast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!text || !text.trim()) {
      addToast('No text to translate', 'error');
      return;
    }

    try {
      setIsTranslating(true);
      setError(null);
      
      const result = await api('/api/translate', {
        method: 'POST',
        body: { 
          text: text.trim(), 
          targetLang 
        }
      });

      setTranslatedText(result.translatedText);
      setShowTranslation(true);
      addToast('Translation completed successfully!', 'success');
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.message);
      addToast('Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTranslation = () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
    } else {
      handleTranslate();
    }
  };

  const getButtonVariant = () => {
    if (variant === 'primary') {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return 'border border-gray-300 text-gray-700 hover:bg-gray-50';
  };

  const getButtonSize = () => {
    if (size === 'lg') {
      return 'px-4 py-2 text-base';
    }
    return 'px-3 py-1.5 text-sm';
  };

  return (
    <div className="space-y-3">
      <button
        onClick={toggleTranslation}
        disabled={isTranslating || !text?.trim()}
        className={`inline-flex items-center space-x-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonVariant()} ${getButtonSize()} ${className}`}
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Languages className="w-4 h-4" />
        )}
        <span>
          {isTranslating ? 'Translating...' : buttonText}
        </span>
        {translatedText && (
          showTranslation ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        )}
      </button>

      {/* Translation Result */}
      {showTranslation && translatedText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">
              Translation ({targetLang === 'ms' ? 'Bahasa Malaysia' : 'English'})
            </h4>
            <button
              onClick={() => setShowTranslation(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Hide
            </button>
          </div>
          <div className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
            {translatedText}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}