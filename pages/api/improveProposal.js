// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement
// Uses tender context, proposal content, and company profile to enhance proposals

import { getTenderById, getCompanyProfile } from '../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId, proposalContent } = req.body;
  
  if (!tenderId || !proposalContent) {
    return res.status(400).json({ error: 'tenderId and proposalContent are required' });
  }

  try {
    // Get tender details and company profile for context
    const tender = getTenderById(tenderId);
    const profile = getCompanyProfile();
    
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Build context for AI improvement
    const tenderContext = `Title: ${tender.title}\nDescription: ${tender.description}`;
    const companyContext = profile ? 
      `Company: ${profile.name}\nExperience: ${profile.experience}\nCertifications: ${profile.certifications?.join(', ') || 'None'}` :
      'Company profile not available';

    // Mock AI improvement (in real app, would use Claude/GPT API)
    if (!process.env.ANTHROPIC_API_KEY) {
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

    // Use Claude AI for real improvement (when API key is available)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        temperature: 0.7,
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
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const improvedContent = data.content[0].text.trim();
    
    return res.status(200).json({ 
      improvedContent,
      improvements: [
        'Enhanced executive summary',
        'Improved technical approach',
        'Strengthened value proposition',
        'Better alignment with requirements'
      ]
    });
  } catch (error) {
    console.error('Proposal improvement error:', error);
    return res.status(500).json({ error: 'Failed to improve proposal' });
  }
}