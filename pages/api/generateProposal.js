// pages/api/generateProposal.js
// This API endpoint generates a proposal draft for a specific tender
// It uses AI to create a professional proposal based on the tender and company profile

import { getTenderById, getCompanyProfile, createProposal } from '../../lib/store';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId } = req.body;
  if (!tenderId) {
    return res.status(400).json({ error: 'tenderId is required' });
  }

  // Get tender details
  const tender = getTenderById(tenderId);
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }

  // Get company profile
  const profile = getCompanyProfile();
  if (!profile) {
    return res.status(500).json({ error: 'Company profile missing' });
  }

  // If no API key, create a dummy proposal content for testing
  if (!process.env.ANTHROPIC_API_KEY) {
    const dummyContent = 
      `# Proposal for ${tender.title}\n\n` +
      `## Executive Summary\n\n` +
      `Dear Sir/Madam,\n\n` +
      `${profile.name} is pleased to submit our proposal for "${tender.title}" as advertised by ${tender.agency}. ` +
      `With our extensive experience in ${tender.category.toLowerCase()} and proven track record of successful project delivery, ` +
      `we are confident in our ability to meet and exceed all requirements outlined in this tender.\n\n` +
      `## Company Overview\n\n` +
      `${profile.experience}\n\n` +
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
      `*(This is a mock proposal generated for testing purposes)*`;
    
    // Create a new proposal with the dummy content
    const dummyProposalId = createProposal(tender, dummyContent);
    return res.status(200).json({ proposalId: dummyProposalId });
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
            content: `You are a professional proposal writer. Write a compelling proposal for the following tender, highlighting the company's qualifications and addressing the tender requirements.\n\nTender:\nTitle: ${tender.title}\nDescription: ${tender.description}\n\nCompany:\nName: ${profile.name}\nCertifications: ${profile.certifications?.join(', ') || 'None'}\nExperience: ${profile.experience}\n\nThe proposal should be well-structured with sections like Executive Summary, Company Overview, Approach, and Conclusion. Use a professional tone and format it with markdown headers.`
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
    
    // Save the proposal and get its new ID
    const newProposalId = createProposal(tender, proposalText);
    return res.status(200).json({ proposalId: newProposalId });
  } catch (err) {
    console.error("Proposal generation error:", err);
    return res.status(500).json({ error: 'Failed to generate proposal' });
  }
}