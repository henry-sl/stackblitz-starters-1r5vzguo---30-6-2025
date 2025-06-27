// components/Help/FAQAccordion.jsx
// Accordion component for displaying FAQ items
// Provides expandable/collapsible FAQ entries with search highlighting

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function FAQAccordion({ faqs, searchTerm = '' }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Highlight search terms in text
  const highlightText = (text, term) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? 'No FAQs found matching your search.' : 'No FAQs available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => {
        const isExpanded = expandedItems.has(faq.id);
        
        return (
          <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {highlightText(faq.question, searchTerm)}
                </h3>
                {faq.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {faq.category}
                  </span>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="prose prose-sm max-w-none text-gray-700 mt-3">
                  {highlightText(faq.answer, searchTerm)}
                </div>
                
                {faq.tags && faq.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {faq.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {faq.lastUpdated && (
                  <div className="mt-3 text-xs text-gray-500">
                    Last updated: {new Date(faq.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}