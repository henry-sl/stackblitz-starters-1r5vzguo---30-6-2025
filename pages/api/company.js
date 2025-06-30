// pages/api/company.js
// API endpoint for company profile operations with enhanced field mapping and data sanitization
// Updated to support all the new fields from the detailed company profile

import { createClient } from '@supabase/supabase-js';
import { companyOperations } from '../../lib/database';

// Helper function to sanitize experience text
const sanitizeExperienceText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove common placeholder text patterns
  const placeholderPatterns = [
    /You can enter this information into the fields\s*\.?\s*/gi,
    /\*\*Company Background:\*\*\s*/gi,
    /\*\*Certifications:\*\*\s*/gi,
    /\*\*Company Experience:\*\*\s*/gi,
    /\*\*Experience:\*\*\s*/gi,
    /Please complete your profile first\s*\.?\s*/gi,
    /Enter your company information here\s*\.?\s*/gi,
    /Add your company details\s*\.?\s*/gi,
    /Complete your company profile\s*\.?\s*/gi,
    // Remove duplicate company name patterns
    /^([^.]+)\s+is\s+\1\s+/gi,
    // Remove excessive whitespace and newlines
    /\n\s*\n\s*\n/g,
    /\s{3,}/g
  ];
  
  let cleanedText = text;
  
  // Apply all sanitization patterns
  placeholderPatterns.forEach(pattern => {
    if (pattern.toString().includes('\\n')) {
      cleanedText = cleanedText.replace(pattern, '\n\n');
    } else {
      cleanedText = cleanedText.replace(pattern, ' ');
    }
  });
  
  // Clean up extra whitespace and normalize
  cleanedText = cleanedText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
  
  return cleanedText;
};

export default async function handler(req, res) {
  console.log(`[Company API] ${req.method} request received`);
  
  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[Company API] No authorization token provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('[Company API] Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
      return res.status(500).json({ error: 'Server configuration error: Missing Supabase URL' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Company API] Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error: Missing service role key' });
    }

    console.log('[Company API] Creating Supabase service role client');
    
    // Create a Supabase client with service role key for server-side operations
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('[Company API] Verifying JWT token');
    
    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabaseServiceRole.auth.getUser(token);
    
    if (authError) {
      console.error('[Company API] Authentication error:', authError);
      return res.status(401).json({ error: 'Authentication failed', details: authError.message });
    }
    
    if (!user) {
      console.error('[Company API] No user found in token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log(`[Company API] User authenticated: ${user.id}`);

    // GET request - retrieve company profile
    if (req.method === 'GET') {
      try {
        console.log('[Company API] Fetching company profile');
        const profile = await companyOperations.getProfile(supabaseServiceRole, user.id);
        
        // Return empty object if no profile exists yet
        if (!profile) {
          console.log('[Company API] No profile found, returning empty object');
          return res.status(200).json({});
        }
        
        // Transform snake_case to camelCase for frontend with enhanced fields and sanitization
        const transformedProfile = {
          name: profile.name,
          registrationNumber: profile.registration_number,
          address: profile.address,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          establishedYear: profile.established_year,
          certifications: profile.certifications,
          experience: sanitizeExperienceText(profile.experience), // Sanitize experience text
          contactEmail: profile.contact_email,
          contactPhone: profile.contact_phone,
          specialties: profile.specialties,
          teamSize: profile.team_size,
          // Enhanced fields
          cidbGrade: profile.cidb_grade,
          cidbExpiry: profile.cidb_expiry,
          iso9001: profile.iso9001,
          iso14001: profile.iso14001,
          ohsas18001: profile.ohsas18001,
          contractorLicense: profile.contractor_license,
          licenseExpiry: profile.license_expiry,
          yearsInOperation: profile.years_in_operation,
          totalProjects: profile.total_projects,
          totalValue: profile.total_value,
          majorProjects: profile.major_projects,
          totalEmployees: profile.total_employees,
          engineersCount: profile.engineers_count,
          supervisorsCount: profile.supervisors_count,
          techniciansCount: profile.technicians_count,
          laborersCount: profile.laborers_count,
          keyPersonnel: profile.key_personnel,
          preferredCategories: profile.preferred_categories,
          preferredLocations: profile.preferred_locations,
          budgetRange: profile.budget_range,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        };
        
        console.log('[Company API] Profile found, returning data');
        res.status(200).json(transformedProfile);
      } catch (error) {
        console.error('[Company API] Error fetching company profile:', error);
        console.error('[Company API] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        res.status(500).json({ 
          error: 'Failed to fetch company profile',
          details: error.message 
        });
      }
    } 
    // PUT request - update company profile
    else if (req.method === 'PUT') {
      try {
        const updates = req.body;
        console.log('[Company API] Received update data:', JSON.stringify(updates, null, 2));
        
        // Validate required fields
        if (!updates.name || !updates.name.trim()) {
          console.error('[Company API] Validation failed: Company name is required');
          return res.status(400).json({ error: 'Company name is required' });
        }
        
        // Sanitize experience text before saving
        if (updates.experience) {
          updates.experience = sanitizeExperienceText(updates.experience);
        }
        
        console.log('[Company API] Updating company profile');
        const updatedProfile = await companyOperations.upsertProfile(supabaseServiceRole, user.id, updates);
        
        // Transform snake_case to camelCase for frontend response with enhanced fields and sanitization
        const transformedProfile = {
          name: updatedProfile.name,
          registrationNumber: updatedProfile.registration_number,
          address: updatedProfile.address,
          phone: updatedProfile.phone,
          email: updatedProfile.email,
          website: updatedProfile.website,
          establishedYear: updatedProfile.established_year,
          certifications: updatedProfile.certifications,
          experience: sanitizeExperienceText(updatedProfile.experience), // Sanitize experience text
          contactEmail: updatedProfile.contact_email,
          contactPhone: updatedProfile.contact_phone,
          specialties: updatedProfile.specialties,
          teamSize: updatedProfile.team_size,
          // Enhanced fields
          cidbGrade: updatedProfile.cidb_grade,
          cidbExpiry: updatedProfile.cidb_expiry,
          iso9001: updatedProfile.iso9001,
          iso14001: updatedProfile.iso14001,
          ohsas18001: updatedProfile.ohsas18001,
          contractorLicense: updatedProfile.contractor_license,
          licenseExpiry: updatedProfile.license_expiry,
          yearsInOperation: updatedProfile.years_in_operation,
          totalProjects: updatedProfile.total_projects,
          totalValue: updatedProfile.total_value,
          majorProjects: updatedProfile.major_projects,
          totalEmployees: updatedProfile.total_employees,
          engineersCount: updatedProfile.engineers_count,
          supervisorsCount: updatedProfile.supervisors_count,
          techniciansCount: updatedProfile.technicians_count,
          laborersCount: updatedProfile.laborers_count,
          keyPersonnel: updatedProfile.key_personnel,
          preferredCategories: updatedProfile.preferred_categories,
          preferredLocations: updatedProfile.preferred_locations,
          budgetRange: updatedProfile.budget_range,
          createdAt: updatedProfile.created_at,
          updatedAt: updatedProfile.updated_at
        };
        
        console.log('[Company API] Profile updated successfully');
        res.status(200).json(transformedProfile);
      } catch (error) {
        console.error('[Company API] Error updating company profile:', error);
        console.error('[Company API] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        res.status(500).json({ 
          error: 'Failed to update company profile',
          details: error.message 
        });
      }
    } 
    // Other methods not allowed
    else {
      console.log(`[Company API] Method ${req.method} not allowed`);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Company API] Unexpected error:', error);
    console.error('[Company API] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}