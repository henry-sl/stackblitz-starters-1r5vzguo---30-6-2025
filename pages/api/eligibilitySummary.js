// pages/api/eligibilitySummary.js
// API endpoint for batch eligibility scoring of multiple tenders
// Provides quick eligibility assessment for tender cards

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderIds } = req.body;
  
  if (!tenderIds || !Array.isArray(tenderIds) || tenderIds.length === 0) {
    return res.status(400).json({ error: 'tenderIds array is required' });
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

    // Get company profile from database
    const profile = await companyOperations.getProfile(supabase, user.id);
    
    if (!profile) {
      // Return empty results if no profile exists
      const emptyResults = tenderIds.reduce((acc, id) => {
        acc[id] = { score: 0, status: 'incomplete_profile', message: 'Complete your company profile' };
        return acc;
      }, {});
      
      return res.status(200).json(emptyResults);
    }

    // Get all tenders in a single batch query
    const tenders = await Promise.all(
      tenderIds.map(id => tenderOperations.getById(supabase, id))
    );

    // Calculate eligibility for each tender
    const eligibilitySummaries = {};
    
    for (let i = 0; i < tenderIds.length; i++) {
      const tenderId = tenderIds[i];
      const tender = tenders[i];
      
      if (!tender) {
        eligibilitySummaries[tenderId] = { 
          score: 0, 
          status: 'not_found',
          message: 'Tender not found' 
        };
        continue;
      }
      
      // Calculate eligibility score
      const eligibility = calculateEligibilityScore(tender, profile);
      eligibilitySummaries[tenderId] = eligibility;
    }

    res.status(200).json(eligibilitySummaries);
  } catch (error) {
    console.error('Error calculating eligibility summaries:', error);
    res.status(500).json({ error: 'Failed to calculate eligibility summaries' });
  }
}

/**
 * Calculate eligibility score for a tender based on company profile
 * @param {Object} tender - Tender details
 * @param {Object} profile - Company profile
 * @returns {Object} Eligibility summary with score, status, and message
 */
function calculateEligibilityScore(tender, profile) {
  // Initialize score components
  let totalPoints = 0;
  let maxPoints = 0;
  let matchedCriteria = [];
  let missingCriteria = [];
  
  // Extract requirements from tender description if not explicitly provided
  const requirements = tender.requirements || extractRequirementsFromDescription(tender.description);
  
  // Check CIDB Grade requirement
  const cidbRequirement = requirements.find(req => 
    req.toLowerCase().includes('cidb') && 
    req.toLowerCase().includes('grade')
  );
  
  if (cidbRequirement) {
    maxPoints += 30; // CIDB grade is very important
    
    // Extract required grade (G1-G7)
    const gradeMatch = cidbRequirement.match(/G[1-7]/i);
    if (gradeMatch && profile.cidb_grade) {
      const requiredGrade = parseInt(gradeMatch[0].substring(1));
      const companyGrade = parseInt(profile.cidb_grade.substring(1));
      
      if (companyGrade >= requiredGrade) {
        totalPoints += 30;
        matchedCriteria.push(`CIDB Grade: ${profile.cidb_grade} meets or exceeds required ${gradeMatch[0]}`);
      } else {
        missingCriteria.push(`CIDB Grade: ${profile.cidb_grade} is below required ${gradeMatch[0]}`);
      }
    } else if (!profile.cidb_grade) {
      missingCriteria.push('CIDB Grade: Not provided in your profile');
    }
  }
  
  // Check experience requirements
  const experienceRequirement = requirements.find(req => 
    req.toLowerCase().includes('experience') || 
    req.toLowerCase().includes('years')
  );
  
  if (experienceRequirement) {
    maxPoints += 20;
    
    // Extract required years
    const yearsMatch = experienceRequirement.match(/(\d+)(?:\+)?\s*years?/i);
    if (yearsMatch && profile.years_in_operation) {
      const requiredYears = parseInt(yearsMatch[1]);
      const companyYears = parseInt(profile.years_in_operation);
      
      if (companyYears >= requiredYears) {
        totalPoints += 20;
        matchedCriteria.push(`Experience: ${companyYears} years meets or exceeds required ${requiredYears} years`);
      } else {
        missingCriteria.push(`Experience: ${companyYears} years is below required ${requiredYears} years`);
      }
    } else if (!profile.years_in_operation) {
      missingCriteria.push('Experience: Years in operation not provided in your profile');
    }
  }
  
  // Check certification requirements
  const certificationRequirements = requirements.filter(req => 
    req.toLowerCase().includes('iso') || 
    req.toLowerCase().includes('certification') ||
    req.toLowerCase().includes('certified')
  );
  
  if (certificationRequirements.length > 0) {
    const pointsPerCert = Math.min(10, Math.floor(30 / certificationRequirements.length));
    
    certificationRequirements.forEach(req => {
      maxPoints += pointsPerCert;
      
      // Check if company has matching certification
      const customCerts = profile.custom_certifications || [];
      const hasCertification = customCerts.some(cert => 
        req.toLowerCase().includes(cert.name.toLowerCase())
      );
      
      // Check for ISO standards specifically
      if (req.toLowerCase().includes('iso 9001') && profile.iso9001) {
        totalPoints += pointsPerCert;
        matchedCriteria.push('ISO 9001: Quality Management certification');
      } else if (req.toLowerCase().includes('iso 14001') && profile.iso14001) {
        totalPoints += pointsPerCert;
        matchedCriteria.push('ISO 14001: Environmental Management certification');
      } else if ((req.toLowerCase().includes('iso 45001') || req.toLowerCase().includes('ohsas 18001')) && 
                profile.ohsas18001) {
        totalPoints += pointsPerCert;
        matchedCriteria.push('ISO 45001/OHSAS 18001: Occupational Health & Safety certification');
      } else if (hasCertification) {
        totalPoints += pointsPerCert;
        const matchingCert = customCerts.find(cert => 
          req.toLowerCase().includes(cert.name.toLowerCase())
        );
        matchedCriteria.push(`${matchingCert.name} certification`);
      } else {
        // Extract certification name for the missing criteria
        const certName = req.match(/ISO \d+|[A-Za-z]+ certification/i);
        missingCriteria.push(`${certName ? certName[0] : req}`);
      }
    });
  }
  
  // Check for license requirements
  const licenseRequirement = requirements.find(req => 
    req.toLowerCase().includes('license') || 
    req.toLowerCase().includes('permit')
  );
  
  if (licenseRequirement) {
    maxPoints += 20;
    
    if (profile.contractor_license) {
      totalPoints += 20;
      matchedCriteria.push(`License: ${profile.contractor_license}`);
      
      // Check if license is expired
      if (profile.license_expiry) {
        const expiryDate = new Date(profile.license_expiry);
        if (expiryDate < new Date()) {
          totalPoints -= 10; // Penalty for expired license
          missingCriteria.push('License is expired');
        }
      }
    } else {
      missingCriteria.push('License: Not provided in your profile');
    }
  }
  
  // Calculate final score (percentage)
  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  
  // Determine status based on score
  let status, message;
  
  if (score >= 80) {
    status = 'high_match';
    message = 'High match for your qualifications';
  } else if (score >= 50) {
    status = 'medium_match';
    message = 'Moderate match for your qualifications';
  } else if (score > 0) {
    status = 'low_match';
    message = 'Low match for your qualifications';
  } else {
    status = 'no_match';
    message = 'Insufficient information to determine match';
  }
  
  return {
    score,
    status,
    message,
    matchedCriteria,
    missingCriteria
  };
}

/**
 * Extract requirements from tender description text
 * @param {string} description - Tender description
 * @returns {Array} Array of requirement strings
 */
function extractRequirementsFromDescription(description) {
  if (!description) return [];
  
  const requirements = [];
  
  // Look for common requirement indicators
  const lines = description.split('\n');
  
  // Check for requirements section
  let inRequirementsSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if we're entering a requirements section
    if (trimmedLine.match(/requirements|qualifications|eligibility/i) && 
        trimmedLine.endsWith(':')) {
      inRequirementsSection = true;
      continue;
    }
    
    // Check if we're leaving a requirements section
    if (inRequirementsSection && 
        (trimmedLine === '' || trimmedLine.match(/^[A-Z][\w\s]+:/))) {
      inRequirementsSection = false;
    }
    
    // Extract requirements from bullet points or numbered lists
    if (inRequirementsSection || 
        trimmedLine.match(/^[\-\*•]/) || 
        trimmedLine.match(/^\d+\./)) {
      
      // Clean up the requirement text
      let requirement = trimmedLine
        .replace(/^[\-\*•]\s*/, '')
        .replace(/^\d+\.\s*/, '');
      
      if (requirement && !requirements.includes(requirement)) {
        requirements.push(requirement);
      }
    }
  }
  
  // If no structured requirements found, look for key phrases
  if (requirements.length === 0) {
    const keyPhrases = [
      /CIDB\s+Grade\s+G[1-7]/i,
      /ISO\s+\d+/i,
      /\d+\s+years?\s+experience/i,
      /contractor\s+license/i,
      /certification\s+required/i
    ];
    
    for (const regex of keyPhrases) {
      const match = description.match(regex);
      if (match) {
        requirements.push(match[0]);
      }
    }
  }
  
  return requirements;
}