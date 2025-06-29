// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using Supabase data

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId, proposalContent } = req.body;
  
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

    // Build context for AI improvement
    const tenderContext = `Title: ${tender.title}\nDescription: ${tender.description}\nAgency: ${tender.agency}`;
    const companyContext = profile ? 
      `Company: ${profile.name}\nExperience: ${profile.experience}\nCertifications: ${profile.certifications?.join(', ') || 'None'}` :
      'Company profile not available';

    // Mock AI improvement (in real app, would use OpenAI API)
    if (!process.env.OPENAI_API_KEY) {
      // Simulate AI improvement with enhanced content
      const improvedContent = proposalContent
        .replace(/\[Your Company Name\]/g, profile?.name || 'Your Company Name')
        .replace(/## Executive Summary\n\n.*?\n\n/s, `## Executive Summary

We are pleased to submit our comprehensive proposal for "${tender.title}" as advertised by ${tender.agency}. With our proven track record and specialized expertise, we are uniquely positioned to deliver exceptional results that exceed your expectations while ensuring full compliance with all requirements.

Our approach combines industry best practices with innovative solutions, backed by our experienced team and commitment to quality excellence. We understand the critical importance of this project and are prepared to dedicate our full resources to ensure successful completion within the specified timeline and budget.

`)
        .replace(/## Company Background\n\n.*?\n\n/s, `## Company Background

${profile?.name || 'Our company'} brings extensive experience and proven capabilities to this project. ${profile?.experience || 'We have successfully completed numerous similar projects with excellent results.'} Our team of certified professionals is committed to delivering high-quality work that meets the highest industry standards.

Our key strengths include:
- Proven track record in similar projects
- Certified and experienced team members
- Strong commitment to quality and safety
- Advanced equipment and technology
- Excellent client relationships and references

`);

      return res.status(200).json({ 
        improvedContent,
        improvements: [
          'Enhanced executive summary with stronger value proposition',
          'Improved company background with specific qualifications',
          'Better alignment with tender requirements',
          'More professional and compelling language'
        ]
      });
    }

    // Use OpenAI for real improvement (when API key is available)
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `You are an expert proposal writer. Improve the following tender proposal by making it more compelling, professional, and aligned with the tender requirements. Use the tender and company context provided.

TENDER CONTEXT:
${tenderContext}

COMPANY CONTEXT:
${companyContext}

CURRENT PROPOSAL:
${proposalContent}

Please improve the proposal by:
1. Enhancing the executive summary to be more compelling
2. Strengthening the company background section
3. Improving technical approach and methodology
4. Making the language more professional and persuasive
5. Better aligning content with tender requirements
6. Ensuring all sections flow logically

Return the improved proposal content.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const improvedContent = data.choices[0].message.content.trim();
      
      return res.status(200).json({ 
        improvedContent,
        improvements: [
          'Enhanced executive summary',
          'Improved technical approach',
          'Strengthened value proposition',
          'Better alignment with requirements'
        ]
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