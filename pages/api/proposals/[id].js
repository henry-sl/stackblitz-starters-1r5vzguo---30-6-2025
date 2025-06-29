// pages/api/proposals/[id].js
// API endpoint for fetching and deleting specific proposals by ID from Supabase database

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../../lib/database';

export default async function handler(req, res) {
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

    // Handle GET request - fetch proposal by ID
    if (req.method === 'GET') {
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
    }
    // Handle DELETE request - delete proposal by ID
    else if (req.method === 'DELETE') {
      // First, get the proposal to verify ownership
      const proposal = await proposalOperations.getById(supabase, id);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Verify user owns this proposal
      if (proposal.user_id !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only allow deletion of draft proposals
      if (proposal.status !== 'draft') {
        return res.status(400).json({ 
          error: 'Only draft proposals can be deleted',
          details: `Cannot delete ${proposal.status} proposals`
        });
      }

      // Delete the proposal from the database
      const { error: deleteError } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Double-check ownership in the delete query

      if (deleteError) {
        console.error('Error deleting proposal:', deleteError);
        return res.status(500).json({ 
          error: 'Failed to delete proposal',
          details: deleteError.message 
        });
      }

      // Also delete associated proposal versions
      const { error: versionsDeleteError } = await supabase
        .from('proposal_versions')
        .delete()
        .eq('proposal_id', id);

      if (versionsDeleteError) {
        console.warn('Error deleting proposal versions:', versionsDeleteError);
        // Don't fail the request if version deletion fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Proposal deleted successfully' 
      });
    }
    // Method not allowed
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in proposals API:', error);
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Proposal not found' });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}