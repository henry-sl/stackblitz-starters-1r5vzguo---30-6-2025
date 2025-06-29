// pages/api/chatAssistant.js
// API endpoint for AI chat assistance in proposal editor

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';
import { buildPrompt, validateResponse, TASK_CONFIGS } from '../../lib/aiPrompts';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId, proposalContent, userMessage, chatHistory = [] } = req.body;
  
  if (!tenderId || !userMessage) {
    return res.status(400).json({ error: 'tenderId and userMessage are required' });
  }

  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get tender details and company profile for context
    const tender = await tenderOperations.getById(supabase, tenderId);
    const profile = await companyOperations.getProfile(supabase, user.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Mock AI chat response (in real app, would use OpenAI API)
    if (!process.env.OPENAI_API_KEY) {
      // Generate contextual responses based on user message
      let aiResponse = '';
      
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('requirement') || lowerMessage.includes('criteria')) {
        aiResponse = `Based on the tender requirements, the key criteria include: ${tender.requirements?.slice(0, 3).join(', ') || 'technical expertise, relevant experience, and compliance certifications'}. Would you like me to help you address any specific requirement in your proposal?`;
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        aiResponse = `The tender budget is ${tender.budget || 'not specified'}. I recommend structuring your pricing to be competitive while ensuring you can deliver quality work. Would you like help with the pricing section of your proposal?`;
      } else if (lowerMessage.includes('experience') || lowerMessage.includes('qualification')) {
        aiResponse = `Your company has ${profile?.experience ? 'relevant experience' : 'capabilities'} that align with this tender. I suggest highlighting your ${profile?.certifications?.length ? 'certifications and' : ''} past projects in the proposal. Shall I help you draft that section?`;
      } else if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('enhance')) {
        aiResponse = `I can help improve your proposal by strengthening the executive summary, adding more specific details about your approach, or better aligning with the tender requirements. What specific area would you like to focus on?`;
      } else if (lowerMessage.includes('deadline') || lowerMessage.includes('timeline') || lowerMessage.includes('schedule')) {
        aiResponse = `The tender closing date is ${tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'not specified'}. Make sure to submit well before the deadline. Would you like help with the project timeline section?`;
      } else {
        aiResponse = `I understand you're asking about "${userMessage}". Based on the tender details and your company profile, I'd recommend focusing on your strengths and how they align with the project requirements. Could you be more specific about what aspect you'd like help with?`;
      }
      
      return res.status(200).json({ 
        response: aiResponse
      });
    }

    // Use structured prompt system for OpenAI
    try {
      const context = {
        tender: {
          title: tender.title,
          description: tender.description,
          agency: tender.agency,
          category: tender.category,
          budget: tender.budget,
          requirements: tender.requirements
        },
        company: {
          name: profile?.name,
          registrationNumber: profile?.registration_number,
          certifications: profile?.certifications,
          experience: profile?.experience,
          contactEmail: profile?.contact_email
        },
        proposalContent: proposalContent || ''
      };

      const messages = buildPrompt('CHAT_ASSISTANCE', context, '', userMessage, chatHistory);
      const config = TASK_CONFIGS.CHAT_ASSISTANCE;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          ...config,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();
      
      return res.status(200).json({ 
        response: aiResponse
      });
    } catch (aiError) {
      console.error('AI chat error:', aiError);
      // Fall back to mock response
      return res.status(200).json({ 
        response: "I'm here to help with your proposal. Could you please rephrase your question? I can assist with requirements analysis, proposal structure, or specific content suggestions."
      });
    }
  } catch (error) {
    console.error('Chat assistant error:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
}