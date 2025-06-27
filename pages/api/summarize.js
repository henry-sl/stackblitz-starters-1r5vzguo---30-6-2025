// pages/api/summarize.js
// This API endpoint generates a concise summary of a tender
// It uses AI to extract the key points from the tender description

import { getTenderById } from '../../lib/store';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
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

  // Construct the prompt for Claude AI
  const prompt = 
    `Human: Please summarize the following tender in 3-4 sentences, focusing on the key points and requirements.\n\n` +
    `Tender Title: "${tender.title}"\n` +
    `Tender Description: "${tender.description}"\n\n` +
    `Assistant:`;

  // If no API key (development), return a mock response
  if (!process.env.ANTHROPIC_API_KEY) {
    const mockSummary = `This tender from ${tender.agency} seeks qualified contractors for ${tender.title.toLowerCase()}. ` +
      `The project involves comprehensive ${tender.category.toLowerCase()} services with specific certification and experience requirements. ` +
      `Successful bidders must demonstrate relevant expertise and meet all technical specifications outlined in the tender documentation.`;
    
    return res.status(200).json({
      summary: mockSummary
    });
  }

  // Use Claude AI to generate a summary (when API key is available)
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
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `Please summarize the following tender in 3-4 sentences, focusing on the key points and requirements.\n\nTender Title: "${tender.title}"\nTender Description: "${tender.description}"`
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
    const summaryText = data.content[0].text.trim();
    
    return res.status(200).json({ summary: summaryText });
  } catch (err) {
    console.error("Summarize API error:", err);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}