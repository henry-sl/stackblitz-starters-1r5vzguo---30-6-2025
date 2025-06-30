// pages/api/submitProposal.js
// API endpoint for submitting proposals and recording blockchain attestations

import { createClient } from '@supabase/supabase-js';
import { proposalOperations, attestationOperations } from '../../lib/database';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { proposalId } = req.body;
  
  // Validate required fields
  if (!proposalId) {
    return res.status(400).json({ error: 'proposalId is required' });
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

    // Get the proposal to verify ownership and get tender details
    const proposal = await proposalOperations.getById(supabase, proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Verify user owns this proposal
    if (proposal.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate a mock blockchain transaction ID
    const mockTxId = 'ALGO' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    // Update proposal status to submitted and record blockchain transaction
    const updatedProposal = await proposalOperations.update(
      supabase, 
      proposalId, 
      user.id, 
      { 
        status: 'submitted',
        submission_date: new Date().toISOString(),
        blockchain_tx_id: mockTxId
      }
    );

    // Create attestation record
    await attestationOperations.create(supabase, user.id, {
      proposal_id: proposalId,
      tender_title: proposal.tenders?.title || proposal.title,
      agency: proposal.tenders?.agency || 'Unknown Agency',
      tx_id: mockTxId,
      status: 'confirmed',
      metadata: {
        proposal_id: proposalId,
        tender_id: proposal.tender_id,
        submission_timestamp: new Date().toISOString()
      }
    });
    
    // Return success response with transaction ID
    res.status(200).json({ 
      txId: mockTxId,
      status: 'submitted'
    });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    res.status(500).json({ error: 'Failed to submit proposal' });
  }
}