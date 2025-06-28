// pages/api/checkEligibility.js
// This API endpoint checks if a company is eligible for a specific tender using Supabase
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

    // Get company profile from Supabase
    const { data: profile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Mock response for local dev (no API key)
    if (!process.env.ANTHROPIC_API_KEY) {
      // Generate mock eligibility based on tender category
      let mockEligibility = [];
      
      if (tender.category === 'Construction') {
        mockEligibility = [
          { requirement: "Minimum 10 years experience in commercial construction", eligible: profile?.years_in_operation >= 10 },
          { requirement: "ISO 9001:2015 Quality Management certification", eligible: profile?.iso9001 || false },
          { requirement: "Valid contractor license Grade A", eligible: profile?.cidb_grade === 'G5' || profile?.cidb_grade === 'G6' || profile?.cidb_grade === 'G7' },
          { requirement: "Previous experience with government projects", eligible: true },
          { requirement: "Safety certification (OHSAS 18001 or equivalent)", eligible: profile?.ohsas18001 || false }
        ];
      } else if (tender.category === 'IT Services') {
        mockEligibility = [
          { requirement: "Cloud architecture certification (AWS/Azure)", eligible: false },
          { requirement: "ISO 27001 Information Security certification", eligible: false },
          { requirement: "Minimum 5 years experience in large-scale IT projects", eligible: profile?.years_in_operation >= 5 },
          { requirement: "Proven expertise in government sector IT solutions", eligible: true },
          { requirement: "Local presence with certified technical staff", eligible: true }
        ];
      } else {
        mockEligibility = [
          { requirement: "Relevant industry experience and certifications", eligible: profile?.years_in_operation >= 3 },
          { requirement: "Financial capacity and technical capabilities", eligible: true },
          { requirement: "Compliance with regulatory requirements", eligible: profile?.iso9001 || false }
        ];
      }

      return res.status(200).json({ eligibility: mockEligibility });
    }

    // Build structured prompt with tender + profile info for AI analysis
    const tenderText = `Title: ${tender.title}\nDescription: ${tender.description}`;
    const profileText = profile ? 
      `Name: ${profile.company_name}\n` +
      `Registration Number: ${profile.registration_number}\n` +
      `Certifications: ISO 9001: ${profile.iso9001}, ISO 14001: ${profile.iso14001}, OHSAS 18001: ${profile.ohsas18001}\n` +
      `CIDB Grade: ${profile.cidb_grade}\n` +
      `Years in Operation: ${profile.years_in_operation}` :
      'Company profile not available';

    // Use Claude AI to analyze eligibility (when API key is available)
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
        const errorText = await response.text();
        console.error('Anthropic API error:', errorText);
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
    } catch (err) {
      console.error("Eligibility check error:", err);
      return res.status(500).json({ error: 'Failed to check eligibility' });
    }
  } catch (error) {
    console.error('Error in checkEligibility:', error);
    return res.status(500).json({ error: 'Failed to check eligibility' });
  }
}