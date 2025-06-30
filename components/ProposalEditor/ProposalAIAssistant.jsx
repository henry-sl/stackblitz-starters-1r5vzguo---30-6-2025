// components/ProposalEditor/ProposalAIAssistant.jsx
// AI Assistant chatbot component for proposal editor

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
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
  const [activeTab, setActiveTab] = useState('suggestions');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  
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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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

  // Handle key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter will naturally create a new line in textarea
  };

  // Quick action buttons with auto-switch to chat tab
  const handleKeyStrengthsAnalysis = () => {
    setChatInput('What are the key strengths my company should highlight for this tender?');
    setActiveTab('chat'); // Switch to chat tab
    setTimeout(handleSendMessage, 100);
  };

  const handleCompetitiveAnalysis = () => {
    setChatInput('Can you help me understand the competitive landscape for this tender?');
    setActiveTab('chat'); // Switch to chat tab
    setTimeout(handleSendMessage, 100);
  };

  const handleRequirementsAnalysis = () => {
    setChatInput('Please analyze the tender requirements and tell me what I need to focus on');
    setActiveTab('chat'); // Switch to chat tab
    setTimeout(handleSendMessage, 100);
  };

  const handleProposalStrategy = () => {
    setChatInput('What strategy should I use when writing my proposal for this tender?');
    setActiveTab('chat'); // Switch to chat tab
    setTimeout(handleSendMessage, 100);
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Improve Executive Summary',
      action: () => {
        setChatInput('Please improve the executive summary to be more compelling and highlight our key strengths');
        setActiveTab('chat');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Add Technical Details',
      action: () => {
        setChatInput('Help me add more technical details to strengthen our technical approach section');
        setActiveTab('chat');
        setTimeout(handleSendMessage, 100);
      }
    },
    {
      label: 'Review Requirements',
      action: () => {
        setChatInput('Can you help me ensure our proposal addresses all the tender requirements?');
        setActiveTab('chat');
        setTimeout(handleSendMessage, 100);
      }
    }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
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

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Quick Actions - Only visible when not in chat tab */}
        {activeTab === 'suggestions' && (
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
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
        )}

        {/* Tab Navigation */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chat
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'suggestions' ? (
          /* Suggestions Content */
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                    <MessageSquare className="w-4 h-4 text-purple-600" />
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
              <Card className="p-4 border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer" onClick={handleProposalStrategy}>
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
          </div>
        ) : (
          /* Chat Content */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages - Scrollable Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0"
              style={{ maxHeight: 'calc(100% - 120px)' }} // Reserve space for input area
            >
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

            {/* Chat Input - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    placeholder="Ask about the proposal, tender requirements..."
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}