// pages/api/company.js
// This API endpoint handles company profile operations with Supabase
// Updated to use proper server-side JWT verification and enhanced error logging

import { createClient } from '@supabase/supabase-js';
import { companyOperations } from '../../lib/database';

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
        
        console.log('[Company API] Profile found, returning data');
        res.status(200).json(profile);
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
        
        console.log('[Company API] Updating company profile');
        const updatedProfile = await companyOperations.upsertProfile(supabaseServiceRole, user.id, updates);
        
        console.log('[Company API] Profile updated successfully');
        res.status(200).json(updatedProfile);
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