// pages/api/generateProposal.js
// This API endpoint generates a proposal draft for a specific tender using Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../lib/supabaseClient';

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
    // Get the user from the request
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get tender details from Supabase
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single();

    if (tenderError) {
      if (tenderError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tender not found' });
      }
      console.error('Error fetching tender:', tenderError);
      return res.status(500).json({ error: 'Failed to fetch tender details' });
    }

    // Get company profile for context
    const { data: profile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no API key, create a dummy proposal content for testing
    if (!process.env.ANTHROPIC_API_KEY) {
      const dummyContent = 
        `# Proposal for ${tender.title}\n\n` +
        `## Executive Summary\n\n` +
        `Dear Sir/Madam,\n\n` +
        `${profile?.company_name || 'Our company'} is pleased to submit our proposal for "${tender.title}" as advertised by ${tender.agency}. ` +
        `With our extensive experience in ${tender.category.toLowerCase()} and proven track record of successful project delivery, ` +
        `we are confident in our ability to meet and exceed all requirements outlined in this tender.\n\n` +
        `## Company Overview\n\n` +
        `${profile?.years_in_operation ? `With ${profile.years_in_operation} years of experience, ` : ''}` +
        `we have established ourselves as a reliable partner in delivering high-quality projects. ` +
        `Our team of qualified professionals is committed to excellence and customer satisfaction.\n\n` +
        `## Our Approach\n\n` +
        `We propose a comprehensive approach that addresses all technical requirements while ensuring quality, ` +
        `timeline adherence, and cost-effectiveness. Our methodology includes:\n\n` +
        `- Detailed project planning and risk assessment\n` +
        `- Quality assurance and compliance with all standards\n` +
        `- Regular progress reporting and stakeholder communication\n` +
        `- Post-implementation support and maintenance\n\n` +
        `## Qualifications\n\n` +
        `${profile?.cidb_grade ? `Our CIDB Grade ${profile.cidb_grade} certification demonstrates our capability to handle projects of this scale.\n` : ''}` +
        `${profile?.iso9001 ? `We maintain ISO 9001:2015 Quality Management certification.\n` : ''}` +
        `${profile?.total_employees ? `Our team consists of ${profile.total_employees} qualified professionals.\n` : ''}\n` +
        `## Conclusion\n\n` +
        `We look forward to the opportunity to discuss our proposal in detail and demonstrate how ${profile?.company_name || 'our company'} ` +
        `can deliver exceptional value for this important project.\n\n` +
        `Sincerely,\n` +
        `${profile?.company_name || 'Your Company'} Team\n\n` +
        `*(This is a mock proposal generated for testing purposes)*`;
      
      // Create a new proposal in Supabase
      const { data: newProposal, error: insertError } = await supabase
        .from('proposals')
        .insert({
          tender_id: tenderId,
          user_id: user.id,
          tender_title: tender.title,
          content: dummyContent,
          status: 'draft',
          version: 1
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating proposal:', insertError);
        return res.status(500).json({ error: 'Failed to create proposal' });
      }

      return res.status(200).json({ proposalId: newProposal.id });
    }

    // Use Claude AI to generate a proposal (when API key is available)
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
              content: `You are a professional proposal writer. Write a compelling proposal for the following tender, highlighting the company's qualifications and addressing the tender requirements.\n\nTender:\nTitle: ${tender.title}\nDescription: ${tender.description}\n\nCompany:\nName: ${profile?.company_name || 'Your Company'}\nCertifications: ${profile?.iso9001 ? 'ISO 9001:2015' : 'None'}\nExperience: ${profile?.years_in_operation || 'Not specified'} years\n\nThe proposal should be well-structured with sections like Executive Summary, Company Overview, Approach, and Conclusion. Use a professional tone and format it with markdown headers.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', errorText);
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const proposalText = data.content[0].text.trim();
      
      // Create a new proposal in Supabase
      const { data: newProposal, error: insertError } = await supabase
        .from('proposals')
        .insert({
          tender_id: tenderId,
          user_id: user.id,
          tender_title: tender.title,
          content: proposalText,
          status: 'draft',
          version: 1
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating proposal:', insertError);
        return res.status(500).json({ error: 'Failed to create proposal' });
      }

      return res.status(200).json({ proposalId: newProposal.id });
    } catch (err) {
      console.error("Proposal generation error:", err);
      return res.status(500).json({ error: 'Failed to generate proposal' });
    }
  } catch (error) {
    console.error('Error in generateProposal:', error);
    return res.status(500).json({ error: 'Failed to generate proposal' });
  }
}