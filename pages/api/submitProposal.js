// pages/api/submitProposal.js
// This API endpoint simulates submitting a proposal to the blockchain using Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../lib/supabaseClient';

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

    // Generate a mock blockchain transaction ID
    const mockTxId = 'ALGO' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    // Update proposal status to 'submitted' in Supabase
    const { data: updatedProposal, error } = await supabase
      .from('proposals')
      .update({ 
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .eq('user_id', user.id) // Ensure user can only update their own proposals
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        return res.status(404).json({ error: 'Proposal not found' });
      }
      console.error('Error submitting proposal:', error);
      return res.status(500).json({ error: 'Failed to submit proposal' });
    }
    
    // In a real app, this would:
    // 1. Create blockchain transaction
    // 2. Store attestation record
    
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