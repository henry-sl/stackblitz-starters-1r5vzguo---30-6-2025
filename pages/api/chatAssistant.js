// pages/api/chatAssistant.js
// API endpoint for AI chat assistance in both proposal editor and tender details

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
      
      if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
        aiResponse = `Here's a summary of this tender: "${tender.title}" by ${tender.agency} is a ${tender.category} project with a budget of ${tender.budget || 'unspecified amount'}. The tender closes ${tender.closingDate ? `on ${new Date(tender.closingDate).toLocaleDateString()}` : 'soon'}. Key focus areas include the scope outlined in the description. Would you like me to analyze specific requirements?`;
      } else if (lowerMessage.includes('requirement') || lowerMessage.includes('criteria') || lowerMessage.includes('eligibility')) {
        const requirements = tender.requirements || ['technical expertise', 'relevant experience', 'compliance certifications'];
        aiResponse = `Based on the tender requirements, the key criteria include: ${requirements.slice(0, 3).join(', ')}. ${profile ? `Your company profile shows ${profile.certifications?.length || 0} certifications and relevant experience.` : 'Complete your company profile to get a detailed eligibility assessment.'} Would you like me to help you address any specific requirement?`;
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        aiResponse = `The tender budget is ${tender.budget || 'not specified in the public information'}. For competitive positioning, I recommend researching similar projects and ensuring your pricing reflects the value you provide. ${tender.category === 'Construction' ? 'For construction projects, consider material costs, labor, equipment, and contingencies.' : 'Make sure to account for all project phases and deliverables.'} Would you like help with pricing strategy?`;
      } else if (lowerMessage.includes('experience') || lowerMessage.includes('qualification')) {
        aiResponse = `${profile ? `Your company has ${profile.experience ? 'documented experience' : 'capabilities'} that could align with this tender.` : 'To provide specific advice, please complete your company profile first.'} For this ${tender.category} tender, emphasize relevant past projects, certifications, and team expertise. ${profile?.certifications?.length ? `Your ${profile.certifications.length} certifications` : 'Industry certifications'} will strengthen your position. Shall I help you structure this section?`;
      } else if (lowerMessage.includes('strategy') || lowerMessage.includes('win') || lowerMessage.includes('competitive')) {
        aiResponse = `For winning this ${tender.category} tender, I recommend: 1) Clearly demonstrate how you meet all requirements, 2) Highlight unique value propositions, 3) Show relevant experience and successful outcomes, 4) Provide competitive but realistic pricing, 5) Ensure compliance with all submission requirements. ${tender.agency} likely values ${tender.category === 'Construction' ? 'safety, quality, and on-time delivery' : 'innovation, reliability, and cost-effectiveness'}. What specific aspect would you like to focus on?`;
      } else if (lowerMessage.includes('deadline') || lowerMessage.includes('timeline') || lowerMessage.includes('schedule')) {
        const closingDate = tender.closingDate ? new Date(tender.closingDate) : null;
        const daysLeft = closingDate ? Math.ceil((closingDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
        aiResponse = `${closingDate ? `The tender closes on ${closingDate.toLocaleDateString()}${daysLeft ? ` (${daysLeft} days from now)` : ''}` : 'The closing date is not specified in the available information'}. ${daysLeft && daysLeft <= 7 ? 'This is a tight deadline - prioritize completing your proposal quickly.' : 'You have time to prepare a thorough proposal.'} I recommend creating a submission checklist and working backwards from the deadline. Would you like help planning your proposal timeline?`;
      } else if (lowerMessage.includes('competition') || lowerMessage.includes('competitor')) {
        aiResponse = `For ${tender.category} tenders like this, competition typically comes from established firms with relevant experience. Key differentiators often include: specialized expertise, proven track record, competitive pricing, and strong project management capabilities. ${tender.agency} as the client likely prioritizes ${tender.category === 'IT Services' ? 'technical innovation and security' : tender.category === 'Construction' ? 'safety and quality delivery' : 'reliability and value for money'}. Focus on what makes your approach unique. What's your main competitive advantage?`;
      } else {
        aiResponse = `I understand you're asking about "${userMessage}". Based on this ${tender.category} tender from ${tender.agency}, I can help you with analysis, strategy, requirements clarification, or proposal guidance. ${tender.budget ? `With a budget of ${tender.budget}, this is a significant opportunity.` : ''} Could you be more specific about what aspect you'd like help with? I can assist with eligibility, competitive positioning, proposal strategy, or technical requirements.`;
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
          requirements: tender.requirements,
          closingDate: tender.closingDate
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
        response: "I'm here to help with your tender analysis and proposal questions. Could you please rephrase your question? I can assist with requirements analysis, eligibility checks, competitive strategy, or proposal guidance."
      });
    }
  } catch (error) {
    console.error('Chat assistant error:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
}