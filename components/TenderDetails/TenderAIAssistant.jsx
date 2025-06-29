// components/TenderDetails/TenderAIAssistant.jsx
// AI Assistant component specifically for tender analysis and questions

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Bot,
  Send,
  User,
  Lightbulb,
  BarChart,
  CheckCircle,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function TenderAIAssistant({ tenderId }) {
  const { addToast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm your AI tender assistant. I can help you analyze this tender, understand requirements, check eligibility, and provide strategic advice. What would you like to know?",
      timestamp: new Date()
    }
  ]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await api('/api/chatAssistant', {
        method: 'POST',
        body: {
          tenderId,
          proposalContent: '', // No proposal content for tender analysis
          userMessage: currentInput,
          chatHistory: chatMessages.slice(-5) // Send last 5 messages for context
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: response.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      addToast('Failed to get AI response', 'error');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons for tender analysis
  const quickActions = [
    {
      label: 'Summarize Tender',
      icon: FileText,
      action: () => {
        setChatInput('Please provide a comprehensive summary of this tender including key requirements and deadlines');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Check Eligibility',
      icon: CheckCircle,
      action: () => {
        setChatInput('Can you check if my company meets the eligibility requirements for this tender?');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Analyze Competition',
      icon: BarChart,
      action: () => {
        setChatInput('What should I know about the competitive landscape for this type of tender?');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Strategy Advice',
      icon: Lightbulb,
      action: () => {
        setChatInput('What strategy would you recommend for winning this tender?');
        setTimeout(handleSendMessage, 100);
      }
    }
  ];

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Tender AI Assistant</CardTitle>
            <p className="text-sm text-gray-600">Analysis & strategic advice</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Quick Actions */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-700 mb-3">Quick Analysis:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  disabled={isLoading}
                  className="text-xs justify-start h-8"
                >
                  <IconComponent className="w-3 h-3 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'ai' 
                  ? 'bg-purple-600' 
                  : 'bg-gray-600'
              }`}>
                {message.type === 'ai' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[85%] ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'ai'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-purple-700">AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                placeholder="Ask about tender requirements, eligibility, strategy, or analysis..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}