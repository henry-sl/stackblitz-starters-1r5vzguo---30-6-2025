// components/AIAssistant.jsx
// AI Assistant component with tabs for Suggestions and Chat
// Matches the design from the uploaded screenshots

import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('suggestions');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">Tender analysis & proposal help</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'suggestions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'suggestions' ? (
          <div className="space-y-6">
            {/* AI Recommendations Header */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">AI Recommendations</h4>
            </div>

            {/* Competitive Analysis Card */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChartBarIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">Competitive Analysis</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Analyze the user's certifications, experiences, and credentials, and compare them with current market standards for the tender. Advise the user on their market positioning and competitiveness.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Analyze →
                  </button>
                </div>
              </div>

              {/* Related Information Card */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">Related Information</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Tender closes on July 15, 2025. Based on complexity, consider finalizing your draft at least 5 days in advance.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Timeline →
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Full Proposal Draft Button */}
            <div className="pt-4">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm">
                Generate Full Proposal Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chat Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800">
                    Hello! I'm here to help you with this tender. I can analyze your documents, suggest strategies, and answer your questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="pt-8">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask about this tender..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}