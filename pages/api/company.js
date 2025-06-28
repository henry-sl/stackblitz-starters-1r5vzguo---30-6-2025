// pages/api/company.js
// This API endpoint handles company profile operations with Supabase
// Updated to use proper server-side JWT verification

import { createClient } from '@supabase/supabase-js';
import { companyOperations } from '../../lib/database';

export default async function handler(req, res) {
  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Create a Supabase client with service role key for server-side operations
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabaseServiceRole.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // GET request - retrieve company profile
    if (req.method === 'GET') {
      try {
        const profile = await companyOperations.getProfile(user.id);
        
        // Return empty object if no profile exists yet
        if (!profile) {
          return res.status(200).json({});
        }
        
        res.status(200).json(profile);
      } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).json({ error: 'Failed to fetch company profile' });
      }
    } 
    // PUT request - update company profile
    else if (req.method === 'PUT') {
      try {
        const updates = req.body;
        
        // Validate required fields
        if (!updates.name || !updates.name.trim()) {
          return res.status(400).json({ error: 'Company name is required' });
        }
        
        const updatedProfile = await companyOperations.upsertProfile(user.id, updates);
        res.status(200).json(updatedProfile);
      } catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ error: 'Failed to update company profile' });
      }
    } 
    // Other methods not allowed
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unexpected error in company API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}