// pages/api/versions/[id].js
// API endpoint for fetching proposal version history from Supabase database

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../../lib/database';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get proposal ID from the URL

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

    // Get proposal versions from database
    const versions = await proposalOperations.getVersions(supabase, id, user.id);
    
    // Transform data to match frontend expectations
    const transformedVersions = versions.map(version => ({
      id: version.id,
      version: version.version,
      content: version.content,
      changesSummary: version.changes_summary,
      createdAt: version.created_at,
      createdBy: version.created_by
    }));

    // Return version history (or empty array if none exist)
    res.status(200).json(transformedVersions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    if (error.message.includes('access denied')) {
      res.status(403).json({ error: 'Access denied' });
    } else {
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
  }
}