// pages/api/saveDraft.js
// API endpoint for saving proposal draft updates to Supabase database with versioning

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../lib/database';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { proposalId, content } = req.body;
  
  // Validate required fields
  if (!proposalId || content === undefined) {
    return res.status(400).json({ error: 'proposalId and content are required' });
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

    // Update the proposal with new content
    const updatedProposal = await proposalOperations.update(
      supabase, 
      proposalId, 
      user.id, 
      { content }
    );
    
    if (!updatedProposal) {
      return res.status(404).json({ error: 'Proposal not found or access denied' });
    }

    // Save a new version of the proposal
    try {
      await proposalOperations.saveVersion(
        supabase,
        proposalId,
        content,
        'Draft saved'
      );
    } catch (versionError) {
      console.warn('Failed to save version:', versionError);
      // Don't fail the entire request if versioning fails
    }

    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Proposal not found or access denied' });
    } else {
      res.status(500).json({ error: 'Failed to save draft' });
    }
  }
}