// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using structured prompts

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';
import { buildPrompt, validateResponse, TASK_CONFIGS } from '../../lib/aiPrompts';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId, proposalContent, userInstruction = '', chatHistory = [] } = req.body;
  
  if (!tenderId || !proposalContent) {
    return res.status(400).json({ error: 'tenderId and proposalContent are required' });
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

    // Mock AI improvement (in real app, would use OpenAI API)
    if (!process.env.OPENAI_API_KEY) {
      // Simulate AI improvement with enhanced content based on user instruction
      let improvedContent = proposalContent;
      
      if (userInstruction.toLowerCase().includes('add') || userInstruction.toLowerCase().includes('include')) {
        improvedContent += `\n\n## Additional Information\n\nBased on your request: ${userInstruction}\n\nWe have incorporated the requested information to strengthen our proposal and better align with your specific requirements.`;
      } else if (userInstruction.toLowerCase().includes('remove') || userInstruction.toLowerCase().includes('delete')) {
        improvedContent = proposalContent.replace(/\[Your Company Name\]/g, profile?.name || 'Your Company Name');
      } else if (userInstruction.toLowerCase().includes('emphasize') || userInstruction.toLowerCase().includes('highlight')) {
        improvedContent = proposalContent.replace(/## Executive Summary\n\n.*?\n\n/s, `## Executive Summary

**HIGHLIGHTED:** We are pleased to submit our comprehensive proposal for "${tender.title}" as advertised by ${tender.agency}. ${userInstruction} Our proven track record and specialized expertise make us uniquely positioned to deliver exceptional results that exceed your expectations while ensuring full compliance with all requirements.

`);
      } else {
        // General improvement
        improvedContent = proposalContent
          .replace(/\[Your Company Name\]/g, profile?.name || 'Your Company Name')
          .replace(/## Executive Summary\n\n.*?\n\n/s, `## Executive Summary

We are pleased to submit our comprehensive proposal for "${tender.title}" as advertised by ${tender.agency}. With our proven track record and specialized expertise, we are uniquely positioned to deliver exceptional results that exceed your expectations while ensuring full compliance with all requirements.

Our approach combines industry best practices with innovative solutions, backed by our experienced team and commitment to quality excellence. We understand the critical importance of this project and are prepared to dedicate our full resources to ensure successful completion within the specified timeline and budget.

`);
      }

      return res.status(200).json({ 
        improvedContent,
        improvements: [
          'Incorporated user feedback and instructions',
          'Enhanced content based on specific requirements',
          'Maintained professional tone and structure',
          'Aligned with tender requirements'
        ]
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
        proposalContent
      };

      const messages = buildPrompt('PROPOSAL_IMPROVEMENT', context, '', userInstruction, chatHistory);
      const config = TASK_CONFIGS.PROPOSAL_IMPROVEMENT;

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
      const improvedContent = data.choices[0].message.content.trim();
      
      // Validate the response
      const validation = validateResponse(improvedContent, 'PROPOSAL_IMPROVEMENT');
      if (!validation.isValid) {
        console.warn('AI response validation failed:', validation.issues);
      }
      
      return res.status(200).json({ 
        improvedContent,
        improvements: [
          'Enhanced based on user instructions',
          'Improved technical approach',
          'Strengthened value proposition',
          'Better alignment with requirements'
        ],
        validation: validation.isValid ? 'passed' : 'warning'
      });
    } catch (aiError) {
      console.error('AI improvement error:', aiError);
      // Fall back to mock improvement
      return res.status(200).json({ 
        improvedContent: proposalContent + '\n\n*AI improvement service temporarily unavailable*',
        improvements: ['AI service unavailable - no changes made']
      });
    }
  } catch (error) {
    console.error('Proposal improvement error:', error);
    return res.status(500).json({ error: 'Failed to improve proposal' });
  }
}