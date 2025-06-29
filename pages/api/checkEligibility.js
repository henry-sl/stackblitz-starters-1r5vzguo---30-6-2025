// pages/api/checkEligibility.js
// API endpoint for AI-powered eligibility checking using Supabase data

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';

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
      return res.status(400).json({ error: 'Company profile not found. Please complete your profile first.' });
    }

    // Mock response for local dev (no API key)
    if (!process.env.ANTHROPIC_API_KEY) {
      // Generate mock eligibility based on tender category
      let mockEligibility = [];
      
      if (tender.category === 'Construction') {
        mockEligibility = [
          { requirement: "Minimum 10 years experience in commercial construction", eligible: true },
          { requirement: "ISO 9001:2015 Quality Management certification", eligible: true },
          { requirement: "Valid contractor license Grade A", eligible: false },
          { requirement: "Previous experience with government projects", eligible: true },
          { requirement: "Safety certification (OHSAS 18001 or equivalent)", eligible: true }
        ];
      } else if (tender.category === 'Information Technology') {
        mockEligibility = [
          { requirement: "Cloud architecture certification (AWS/Azure)", eligible: false },
          { requirement: "ISO 27001 Information Security certification", eligible: false },
          { requirement: "Minimum 5 years experience in large-scale IT projects", eligible: true },
          { requirement: "Proven expertise in government sector IT solutions", eligible: true },
          { requirement: "Local presence with certified technical staff", eligible: true }
        ];
      } else {
        mockEligibility = [
          { requirement: "Relevant industry experience and certifications", eligible: true },
          { requirement: "Financial capacity and technical capabilities", eligible: true },
          { requirement: "Compliance with regulatory requirements", eligible: false }
        ];
      }

      return res.status(200).json({ eligibility: mockEligibility });
    }

    // Use Claude AI to analyze eligibility (when API key is available)
    try {
      // Build structured prompt with tender + profile info for AI analysis
      const tenderText = `Title: ${tender.title}\nDescription: ${tender.description}\nCategory: ${tender.category}\nRequirements: ${tender.requirements?.join(', ') || 'See description'}`;
      const profileText = 
        `Name: ${profile.name}\n` +
        `Registration Number: ${profile.registration_number || 'Not provided'}\n` +
        `Certifications: ${profile.certifications?.join(', ') || 'None'}\n` +
        `Experience: ${profile.experience || 'Not provided'}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 500,
          temperature: 0.5,
          messages: [
            {
              role: "user",
              content: `Determine if the company is eligible for the tender. List key requirements from the tender and whether the company meets each.\n\nTender Details:\n${tenderText}\n\nCompany Profile:\n${profileText}\n\nProvide the answer as a JSON array of objects with "requirement" and "eligible" fields. Example: [{"requirement": "5+ years experience", "eligible": true}]`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      let eligibilityList;
      
      try {
        const responseText = data.content[0].text;
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\[.*\]/s);
        if (jsonMatch) {
          eligibilityList = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a fallback response
          eligibilityList = [
            { requirement: "General eligibility requirements", eligible: true },
            { requirement: "Technical and financial capabilities", eligible: true }
          ];
        }
      } catch (parseErr) {
        console.error("JSON parsing error:", parseErr);
        // Fallback eligibility response
        eligibilityList = [
          { requirement: "Company meets basic tender requirements", eligible: true },
          { requirement: "Additional verification may be required", eligible: false }
        ];
      }

      return res.status(200).json({ eligibility: eligibilityList });
    } catch (aiError) {
      console.error("AI eligibility check error:", aiError);
      // Fall back to mock response if AI fails
      const fallbackEligibility = [
        { requirement: "Basic eligibility requirements", eligible: true },
        { requirement: "AI analysis temporarily unavailable", eligible: false }
      ];
      return res.status(200).json({ eligibility: fallbackEligibility });
    }
  } catch (err) {
    console.error("Eligibility check error:", err);
    return res.status(500).json({ error: 'Failed to check eligibility' });
  }
}