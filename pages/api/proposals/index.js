// pages/api/proposals/index.js
// API endpoint for listing user's proposals from Supabase database

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../../lib/database';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Get user's proposals
    const proposals = await proposalOperations.getByUser(supabase, user.id);
    
    // Transform data to match frontend expectations
    const transformedProposals = proposals.map(proposal => ({
      id: proposal.id,
      tenderId: proposal.tender_id,
      tenderTitle: proposal.tenders?.title || proposal.title,
      content: proposal.content,
      status: proposal.status,
      version: proposal.version,
      submissionDate: proposal.submission_date,
      blockchainTxId: proposal.blockchain_tx_id,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      // Include nested tender data for compatibility
      tenders: proposal.tenders
    }));

    res.status(200).json(transformedProposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
}