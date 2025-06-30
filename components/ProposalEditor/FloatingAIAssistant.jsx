// components/ProposalEditor/FloatingAIAssistant.jsx
// Floating AI Assistant component that starts as a bubble and expands to a chat window

import React, { useState } from 'react';
import ProposalAIAssistant from './ProposalAIAssistant';
import { Button } from '../ui/button';
import { 
  Bot, 
  X, 
  MessageSquare,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function FloatingAIAssistant({ 
  tenderId, 
  proposalId, 
  currentProposalContent, 
  onUpdateProposalContent 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false); // Reset minimized state when opening
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Bubble - Only visible when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleOpen}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Bot className="w-8 h-8 text-white" />
              {/* Pulse animation */}
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-white opacity-20 animate-ping group-hover:animate-none"></div>
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            AI Assistant
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Floating Chat Window - Only visible when open */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
            isMinimized 
              ? 'w-80 h-16' 
              : 'w-96 h-[600px]'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  {!isMinimized && (
                    <p className="text-xs text-gray-600">Proposal writing help</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Minimize/Maximize button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="w-8 h-8 p-0 hover:bg-blue-200"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleOpen}
                  className="w-8 h-8 p-0 hover:bg-red-200"
                  aria-label="Close AI Assistant"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Content - Only visible when not minimized */}
            {!isMinimized && (
              <div className="h-[calc(600px-65px)]">
                <ProposalAIAssistant
                  tenderId={tenderId}
                  proposalId={proposalId}
                  currentProposalContent={currentProposalContent}
                  onUpdateProposalContent={onUpdateProposalContent}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}