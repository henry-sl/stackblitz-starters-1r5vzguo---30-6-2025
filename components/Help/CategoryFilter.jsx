// components/Help/CategoryFilter.jsx
// Category filter component for organizing FAQ items
// Allows users to filter FAQs by category

import React from 'react';

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  itemCounts = {} 
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900">Categories</h3>
      
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{category.name}</span>
            {itemCounts[category.id] && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === category.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {itemCounts[category.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}