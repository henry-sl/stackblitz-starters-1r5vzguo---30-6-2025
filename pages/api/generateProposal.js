// pages/api/generateProposal.js
// API endpoint for generating AI-powered proposal drafts using Supabase data

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations, proposalOperations } from '../../lib/database';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId } = req.body;
  if (!tenderId) {
    return res.status(400).json({ error: 'tenderId is required' });
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

    // Get tender details from database
    const tender = await tenderOperations.getById(supabase, tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Get company profile from database
    const profile = await companyOperations.getProfile(supabase, user.id);
    if (!profile) {
      return res.status(400).json({ error: 'Complete your company profile first to generate proposals' });
    }

    let proposalContent;

    // If no API key, create a dummy proposal content for testing
    if (!process.env.ANTHROPIC_API_KEY) {
      proposalContent = 
        `# Proposal for ${tender.title}\n\n` +
        `## Executive Summary\n\n` +
        `Dear Sir/Madam,\n\n` +
        `${profile.name} is pleased to submit our proposal for "${tender.title}" as advertised by ${tender.agency}. ` +
        `With our extensive experience in ${tender.category?.toLowerCase()} and proven track record of successful project delivery, ` +
        `we are confident in our ability to meet and exceed all requirements outlined in this tender.\n\n` +
        `## Company Overview\n\n` +
        `${profile.experience || 'Our company brings extensive experience and proven capabilities to this project.'}\n\n` +
        `## Our Approach\n\n` +
        `We propose a comprehensive approach that addresses all technical requirements while ensuring quality, ` +
        `timeline adherence, and cost-effectiveness. Our methodology includes:\n\n` +
        `- Detailed project planning and risk assessment\n` +
        `- Quality assurance and compliance with all standards\n` +
        `- Regular progress reporting and stakeholder communication\n` +
        `- Post-implementation support and maintenance\n\n` +
        `## Qualifications\n\n` +
        `Our certifications include: ${profile.certifications?.join(', ') || 'Various industry certifications'}\n\n` +
        `## Conclusion\n\n` +
        `We look forward to the opportunity to discuss our proposal in detail and demonstrate how ${profile.name} ` +
        `can deliver exceptional value for this important project.\n\n` +
        `Sincerely,\n` +
        `${profile.name} Team\n\n` +
        `*(This is an AI-generated proposal based on your company profile)*`;
    } else {
      // Use Claude AI to generate a proposal
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1500,
            temperature: 0.7,
            messages: [
              {
                role: "user",
                content: `You are a professional proposal writer. Write a compelling proposal for the following tender, highlighting the company's qualifications and addressing the tender requirements.\n\nTender:\nTitle: ${tender.title}\nDescription: ${tender.description}\nAgency: ${tender.agency}\nCategory: ${tender.category}\n\nCompany:\nName: ${profile.name}\nCertifications: ${profile.certifications?.join(', ') || 'None'}\nExperience: ${profile.experience}\n\nThe proposal should be well-structured with sections like Executive Summary, Company Overview, Approach, and Conclusion. Use a professional tone and format it with markdown headers.`
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        proposalContent = data.content[0].text.trim();
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        // Fall back to dummy content if AI fails
        proposalContent = `# Proposal for ${tender.title}\n\n*AI generation failed, using template. Please edit this proposal.*\n\n## Executive Summary\n\nWe are pleased to submit our proposal for this opportunity.\n\n## Company Overview\n\n${profile.experience || 'Our company overview.'}\n\n## Conclusion\n\nWe look forward to working with you.`;
      }
    }
    
    // Save the proposal to database
    const newProposal = await proposalOperations.create(supabase, user.id, {
      tender_id: tender.id,
      title: tender.title,
      content: proposalContent
    });

    return res.status(200).json({ proposalId: newProposal.id });
  } catch (error) {
    console.error("Proposal generation error:", error);
    return res.status(500).json({ error: 'Failed to generate proposal' });
  }
}