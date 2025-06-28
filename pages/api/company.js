// pages/api/company.js
// This API endpoint handles company profile operations with Supabase integration
// It supports GET (retrieve profile) and PUT (update profile) methods

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // GET request - retrieve company profile
  if (req.method === 'GET') {
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

      // Fetch company profile from Supabase
      const { data: profile, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching company profile:', error);
        return res.status(500).json({ error: 'Failed to fetch company profile' });
      }

      // Transform flat Supabase data to nested structure expected by frontend
      const transformedProfile = profile ? {
        basicInfo: {
          companyName: profile.company_name || '',
          registrationNumber: profile.registration_number || '',
          address: profile.address || '',
          phone: profile.phone || '',
          email: profile.email || '',
          website: profile.website || '',
          establishedYear: profile.established_year || ''
        },
        certifications: {
          cidbGrade: profile.cidb_grade || '',
          cidbExpiry: profile.cidb_expiry || '',
          iso9001: profile.iso9001 || false,
          iso14001: profile.iso14001 || false,
          ohsas18001: profile.ohsas18001 || false,
          contractorLicense: profile.contractor_license || '',
          licenseExpiry: profile.license_expiry || ''
        },
        experience: {
          yearsInOperation: profile.years_in_operation || '',
          totalProjects: profile.total_projects || '',
          totalValue: profile.total_value || '',
          specialties: profile.specialties ? JSON.parse(profile.specialties) : [],
          majorProjects: profile.major_projects ? JSON.parse(profile.major_projects) : []
        },
        team: {
          totalEmployees: profile.total_employees || '',
          engineers: profile.engineers || '',
          supervisors: profile.supervisors || '',
          technicians: profile.technicians || '',
          laborers: profile.laborers || '',
          keyPersonnel: profile.key_personnel ? JSON.parse(profile.key_personnel) : []
        },
        preferences: {
          categories: profile.categories ? JSON.parse(profile.categories) : [],
          locations: profile.locations ? JSON.parse(profile.locations) : [],
          budgetRange: profile.budget_range || ''
        }
      } : {
        // Default empty nested structure if no profile exists
        basicInfo: {
          companyName: '',
          registrationNumber: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          establishedYear: ''
        },
        certifications: {
          cidbGrade: '',
          cidbExpiry: '',
          iso9001: false,
          iso14001: false,
          ohsas18001: false,
          contractorLicense: '',
          licenseExpiry: ''
        },
        experience: {
          yearsInOperation: '',
          totalProjects: '',
          totalValue: '',
          specialties: [],
          majorProjects: []
        },
        team: {
          totalEmployees: '',
          engineers: '',
          supervisors: '',
          technicians: '',
          laborers: '',
          keyPersonnel: []
        },
        preferences: {
          categories: [],
          locations: [],
          budgetRange: ''
        }
      };

      res.status(200).json(transformedProfile);
    } catch (error) {
      console.error('Error in GET /api/company:', error);
      res.status(500).json({ error: 'Failed to fetch company profile' });
    }
  } 
  // PUT request - update company profile
  else if (req.method === 'PUT') {
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

      const nestedProfile = req.body;

      // Transform nested frontend data to flat structure for Supabase
      const flatProfile = {
        user_id: user.id,
        company_name: nestedProfile.basicInfo?.companyName || '',
        registration_number: nestedProfile.basicInfo?.registrationNumber || '',
        address: nestedProfile.basicInfo?.address || '',
        phone: nestedProfile.basicInfo?.phone || '',
        email: nestedProfile.basicInfo?.email || '',
        website: nestedProfile.basicInfo?.website || '',
        established_year: nestedProfile.basicInfo?.establishedYear || '',
        cidb_grade: nestedProfile.certifications?.cidbGrade || '',
        cidb_expiry: nestedProfile.certifications?.cidbExpiry || '',
        iso9001: nestedProfile.certifications?.iso9001 || false,
        iso14001: nestedProfile.certifications?.iso14001 || false,
        ohsas18001: nestedProfile.certifications?.ohsas18001 || false,
        contractor_license: nestedProfile.certifications?.contractorLicense || '',
        license_expiry: nestedProfile.certifications?.licenseExpiry || '',
        years_in_operation: nestedProfile.experience?.yearsInOperation || '',
        total_projects: nestedProfile.experience?.totalProjects || '',
        total_value: nestedProfile.experience?.totalValue || '',
        specialties: JSON.stringify(nestedProfile.experience?.specialties || []),
        major_projects: JSON.stringify(nestedProfile.experience?.majorProjects || []),
        total_employees: nestedProfile.team?.totalEmployees || '',
        engineers: nestedProfile.team?.engineers || '',
        supervisors: nestedProfile.team?.supervisors || '',
        technicians: nestedProfile.team?.technicians || '',
        laborers: nestedProfile.team?.laborers || '',
        key_personnel: JSON.stringify(nestedProfile.team?.keyPersonnel || []),
        categories: JSON.stringify(nestedProfile.preferences?.categories || []),
        locations: JSON.stringify(nestedProfile.preferences?.locations || []),
        budget_range: nestedProfile.preferences?.budgetRange || '',
        updated_at: new Date().toISOString()
      };

      // Use upsert to insert or update the profile
      const { data, error } = await supabase
        .from('company_profiles')
        .upsert(flatProfile, { 
          onConflict: 'user_id',
          returning: 'minimal'
        });

      if (error) {
        console.error('Error upserting company profile:', error);
        return res.status(500).json({ error: 'Failed to update company profile' });
      }

      // Transform the flat data back to nested structure for response
      const transformedProfile = {
        basicInfo: {
          companyName: flatProfile.company_name,
          registrationNumber: flatProfile.registration_number,
          address: flatProfile.address,
          phone: flatProfile.phone,
          email: flatProfile.email,
          website: flatProfile.website,
          establishedYear: flatProfile.established_year
        },
        certifications: {
          cidbGrade: flatProfile.cidb_grade,
          cidbExpiry: flatProfile.cidb_expiry,
          iso9001: flatProfile.iso9001,
          iso14001: flatProfile.iso14001,
          ohsas18001: flatProfile.ohsas18001,
          contractorLicense: flatProfile.contractor_license,
          licenseExpiry: flatProfile.license_expiry
        },
        experience: {
          yearsInOperation: flatProfile.years_in_operation,
          totalProjects: flatProfile.total_projects,
          totalValue: flatProfile.total_value,
          specialties: JSON.parse(flatProfile.specialties),
          majorProjects: JSON.parse(flatProfile.major_projects)
        },
        team: {
          totalEmployees: flatProfile.total_employees,
          engineers: flatProfile.engineers,
          supervisors: flatProfile.supervisors,
          technicians: flatProfile.technicians,
          laborers: flatProfile.laborers,
          keyPersonnel: JSON.parse(flatProfile.key_personnel)
        },
        preferences: {
          categories: JSON.parse(flatProfile.categories),
          locations: JSON.parse(flatProfile.locations),
          budgetRange: flatProfile.budget_range
        }
      };

      res.status(200).json(transformedProfile);
    } catch (error) {
      console.error('Error in PUT /api/company:', error);
      res.status(500).json({ error: 'Failed to update company profile' });
    }
  } 
  // Other methods not allowed
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}