// pages/api/proposals/[id].js
// API endpoint for fetching a specific proposal by ID from Supabase database

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../../lib/database';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

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

    // Get proposal by ID
    const proposal = await proposalOperations.getById(supabase, id);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Verify user owns this proposal
    if (proposal.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Transform data to match frontend expectations
    const transformedProposal = {
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
      // Include nested tender data
      tenders: proposal.tenders
    };

    res.status(200).json(transformedProposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Proposal not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch proposal' });
    }
  }
}