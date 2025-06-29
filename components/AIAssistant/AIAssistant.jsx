// components/AIAssistant/AIAssistant.jsx
// AI Assistant component for tender analysis and proposal help

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Bot, // Main AI Assistant icon
  Lightbulb, // For Key Strengths
  BarChart, // For Competitive Analysis
  MessageSquare, // For Chat
  Send, // For Send button
} from 'lucide-react';

export default function AIAssistant({ tenderId }) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm here to help you with this tender. I can analyze requirements, suggest proposal strategies, and answer questions."
    }
  ]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        message: chatInput.trim()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      // Simulate AI response (in real app, this would call an AI API)
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          message: "I understand your question about this tender. Based on the requirements, I'd recommend focusing on your company's relevant experience and certifications. Would you like me to analyze specific aspects of the tender requirements?"
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
      
      setChatInput('');
    }
  };

  const handleKeyStrengthsAnalysis = () => {
    console.log('Analyzing key strengths for tender:', tenderId);
    // In a real application, this would trigger an AI analysis
  };

  const handleCompetitiveAnalysis = () => {
    console.log('Performing competitive analysis for tender:', tenderId);
    // In a real application, this would trigger competitive analysis
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
          <TabsContent value="suggestions" className="p-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-3">
              {/* Key Strengths to Highlight */}
              <Card className="p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Key Strengths to Highlight</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Emphasize your smart city experience and ISO certifications
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-blue-600 hover:text-blue-700"
                      onClick={handleKeyStrengthsAnalysis}
                    >
                      View Details →
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Competitive Analysis */}
              <Card className="p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Competitive Analysis</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Analyze market positioning and competitor strategies
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 mt-2 text-purple-600 hover:text-purple-700"
                      onClick={handleCompetitiveAnalysis}
                    >
                      Analyze →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="p-6 space-y-4">
            <div className="flex flex-col space-y-4 h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.type === 'ai' ? (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg max-w-[80%] ${
                    message.type === 'ai' 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Ask about this tender..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}