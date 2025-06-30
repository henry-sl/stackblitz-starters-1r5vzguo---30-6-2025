// components/AIAssistant/AIAssistant.jsx
// AI Assistant component for tender analysis and proposal help with API connectivity

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Bot, // Main AI Assistant icon
  Lightbulb, // For Key Strengths
  BarChart, // For Competitive Analysis
  MessageSquare, // For Chat
  Send, // For Send button
  User, // For user messages
  RefreshCw, // For loading
} from 'lucide-react';

export default function AIAssistant({ tenderId }) {
  const { addToast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm here to help you with this tender. I can analyze requirements, suggest proposal strategies, and answer questions about the tender details.",
      timestamp: new Date()
    }
  ]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on scrollHeight, with min and max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120); // Min 44px (roughly 1 line), Max 120px (roughly 3 lines)
      textarea.style.height = `${newHeight}px`;
    }
  }, [chatInput]);

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
          proposalContent: '', // No proposal content in tender view
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

  // Handle key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter will naturally create a new line in textarea
  };

  // Quick action functions for suggestions
  const handleKeyStrengthsAnalysis = () => {
    setChatInput('What are the key strengths my company should highlight for this tender?');
    setTimeout(handleSendMessage, 100);
  };

  const handleCompetitiveAnalysis = () => {
    setChatInput('Can you help me understand the competitive landscape for this tender?');
    setTimeout(handleSendMessage, 100);
  };

  const handleRequirementsAnalysis = () => {
    setChatInput('Please analyze the tender requirements and tell me what I need to focus on');
    setTimeout(handleSendMessage, 100);
  };

  const handleProposalStrategy = () => {
    setChatInput('What strategy should I use when writing my proposal for this tender?');
    setTimeout(handleSendMessage, 100);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
            <p className="text-sm text-gray-600">Tender analysis & proposal help</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-200 bg-gray-50">
            <TabsTrigger value="suggestions" className="rounded-none">Suggestions</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-none">Chat</TabsTrigger>
          </TabsList>

          {/* Suggestions Tab Content */}
          <TabsContent value="suggestions" className="px-6 pt-6 pb-4 space-y-4 h-auto">
            <h4 className="text-sm font-medium text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-3">
              {/* Key Strengths to Highlight */}
              <Card className="p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={handleKeyStrengthsAnalysis}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Key Strengths to Highlight</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Get AI analysis of what strengths to emphasize
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Analyze →
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Competitive Analysis */}
              <Card className="p-4 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer" onClick={handleCompetitiveAnalysis}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Competitive Analysis</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Understand market positioning and strategies
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-purple-600 hover:text-purple-700"
                    >
                      Analyze →
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Requirements Analysis */}
              <Card className="p-4 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer" onClick={handleRequirementsAnalysis}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Requirements Analysis</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Break down tender requirements and priorities
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-green-600 hover:text-green-700"
                    >
                      Analyze →
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Proposal Strategy */}
              <Card className="p-4 border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer h-auto" onClick={handleProposalStrategy}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Proposal Strategy</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Get strategic advice for your proposal approach
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-orange-600 hover:text-orange-700"
                    >
                      Get Strategy →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="flex flex-col">
            {/* Chat Messages - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 border border-gray-200 rounded-lg mx-6 mt-4 bg-gray-50 max-h-80">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'ai' 
                      ? 'bg-blue-600' 
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
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-white text-gray-900 border border-gray-200'
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-700">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 p-6 pt-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    placeholder="Ask about this tender..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-hidden leading-5"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}