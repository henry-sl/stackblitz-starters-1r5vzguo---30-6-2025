// components/ProposalEditor/ProposalAIAssistant.jsx
// AI Assistant chatbot component for proposal editor

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
  Sparkles,
  MessageSquare,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

export default function ProposalAIAssistant({ 
  tenderId, 
  proposalId, 
  currentProposalContent, 
  onUpdateProposalContent 
}) {
  const { addToast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImprovingProposal, setIsImprovingProposal] = useState(false);
  const chatEndRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm your AI proposal assistant. I can help you improve your proposal, answer questions about the tender, and provide writing suggestions. How can I assist you today?",
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
          proposalContent: currentProposalContent,
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

  // Handle improving proposal with AI based on chat context
  const handleImproveProposal = async () => {
    if (!currentProposalContent.trim() || isImprovingProposal) return;

    setIsImprovingProposal(true);

    try {
      // Get the last user message as instruction
      const lastUserMessage = chatMessages
        .filter(msg => msg.type === 'user')
        .slice(-1)[0];

      const userInstruction = lastUserMessage ? 
        `Based on our conversation: ${lastUserMessage.message}` : 
        'Please improve this proposal to make it more compelling and professional';

      const response = await api('/api/improveProposal', {
        method: 'POST',
        body: {
          tenderId,
          proposalContent: currentProposalContent,
          userInstruction,
          chatHistory: chatMessages.slice(-10) // Send more context for improvement
        }
      });

      onUpdateProposalContent(response.improvedContent);
      
      // Add confirmation message to chat
      const confirmationMessage = {
        id: Date.now(),
        type: 'ai',
        message: "I've updated your proposal based on our conversation. The changes include: " + 
                response.improvements.join(', ') + ". Please review the updated content.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, confirmationMessage]);
      addToast('Proposal improved successfully!', 'success');
    } catch (error) {
      console.error('Improvement error:', error);
      addToast('Failed to improve proposal', 'error');
    } finally {
      setIsImprovingProposal(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Improve Executive Summary',
      action: () => {
        setChatInput('Please improve the executive summary to be more compelling and highlight our key strengths');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Add Technical Details',
      action: () => {
        setChatInput('Help me add more technical details to strengthen our technical approach section');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Review Requirements',
      action: () => {
        setChatInput('Can you help me ensure our proposal addresses all the tender requirements?');
        setTimeout(handleSendMessage, 100);
      }
    }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
              <p className="text-sm text-gray-600">Proposal writing help</p>
            </div>
          </div>
          <Button
            onClick={handleImproveProposal}
            disabled={isImprovingProposal || !currentProposalContent.trim()}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {isImprovingProposal ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply to Proposal
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                disabled={isLoading}
                className="text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-blue-700">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                placeholder="Ask about the proposal, tender requirements, or request improvements..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="resize-none"
                rows={1}
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
      </CardContent>
    </Card>
  );
}