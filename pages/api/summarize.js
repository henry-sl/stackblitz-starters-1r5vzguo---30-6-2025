// pages/api/summarize.js
// API endpoint for generating AI summaries of tenders using structured prompts

import { createClient } from '@supabase/supabase-js';
import { tenderOperations } from '../../lib/database';
import { buildPrompt, validateResponse, TASK_CONFIGS } from '../../lib/aiPrompts';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const { tenderId } = req.body;
  if (!tenderId) {
    return res.status(400).json({ error: 'tenderId is required' });
  }

  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get tender details from database
    const tender = await tenderOperations.getById(supabase, tenderId);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // If no API key (development), return a mock response
    if (!process.env.OPENAI_API_KEY) {
      const mockSummary = `This tender from ${tender.agency} seeks qualified contractors for ${tender.title.toLowerCase()}. ` +
        `The project involves comprehensive ${tender.category?.toLowerCase()} services with specific certification and experience requirements. ` +
        `Successful bidders must demonstrate relevant expertise and meet all technical specifications outlined in the tender documentation.`;
      
      return res.status(200).json({
        summary: mockSummary
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
        }
      };

      const messages = buildPrompt('SUMMARIZE', context);
      const config = TASK_CONFIGS.SUMMARIZE;

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
      const summaryText = data.choices[0].message.content.trim();
      
      // Validate the response
      const validation = validateResponse(summaryText, 'SUMMARIZE');
      if (!validation.isValid) {
        console.warn('AI response validation failed:', validation.issues);
        // Log but don't fail - use the response anyway for now
      }
      
      return res.status(200).json({ 
        summary: summaryText,
        validation: validation.isValid ? 'passed' : 'warning'
      });
    } catch (aiError) {
      console.error("AI summarize error:", aiError);
      // Fall back to mock summary if AI fails
      const fallbackSummary = `This tender from ${tender.agency} seeks qualified contractors for ${tender.title.toLowerCase()}. ` +
        `The project involves ${tender.category?.toLowerCase()} services. Please review the full tender documentation for detailed requirements.`;
      
      return res.status(200).json({ 
        summary: fallbackSummary,
        validation: 'fallback'
      });
    }
  } catch (err) {
    console.error("Summarize API error:", err);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}