// pages/api/proposals/[id].js
// API endpoint for fetching and deleting specific proposals by ID from Supabase database
// Enhanced with detailed error logging for debugging

import { createClient } from '@supabase/supabase-js';
import { proposalOperations } from '../../../lib/database';

export default async function handler(req, res) {
  const { id } = req.query;

  console.log(`[Proposals API] ${req.method} request for proposal ID: ${id}`);

  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[Proposals API] No authorization token provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Proposals API] Missing Supabase environment variables');
      console.error('[Proposals API] SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('[Proposals API] SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('[Proposals API] Creating Supabase client');

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('[Proposals API] Verifying JWT token');

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('[Proposals API] Authentication error:', authError);
      return res.status(401).json({ 
        error: 'Authentication failed', 
        details: authError.message 
      });
    }
    
    if (!user) {
      console.error('[Proposals API] No user found in token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log(`[Proposals API] User authenticated: ${user.id}`);

    // Handle GET request - fetch proposal by ID
    if (req.method === 'GET') {
      console.log('[Proposals API] Handling GET request');
      
      try {
        // Get proposal by ID
        const proposal = await proposalOperations.getById(supabase, id);
        
        if (!proposal) {
          console.log('[Proposals API] Proposal not found');
          return res.status(404).json({ error: 'Proposal not found' });
        }

        // Verify user owns this proposal
        if (proposal.user_id !== user.id) {
          console.log('[Proposals API] Access denied - user does not own proposal');
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

        console.log('[Proposals API] GET request successful');
        res.status(200).json(transformedProposal);
      } catch (getError) {
        console.error('[Proposals API] Error in GET operation:', getError);
        console.error('[Proposals API] GET error details:', {
          message: getError.message,
          code: getError.code,
          details: getError.details,
          hint: getError.hint,
          stack: getError.stack
        });
        throw getError;
      }
    }
    // Handle DELETE request - delete proposal by ID
    else if (req.method === 'DELETE') {
      console.log('[Proposals API] Handling DELETE request');
      
      try {
        // First, get the proposal to verify ownership
        console.log('[Proposals API] Fetching proposal for verification');
        const proposal = await proposalOperations.getById(supabase, id);
        
        if (!proposal) {
          console.log('[Proposals API] Proposal not found for deletion');
          return res.status(404).json({ error: 'Proposal not found' });
        }

        console.log(`[Proposals API] Found proposal: ${proposal.id}, status: ${proposal.status}, owner: ${proposal.user_id}`);

        // Verify user owns this proposal
        if (proposal.user_id !== user.id) {
          console.log('[Proposals API] Access denied - user does not own proposal for deletion');
          return res.status(403).json({ error: 'Access denied' });
        }

        // Only allow deletion of draft proposals
        if (proposal.status !== 'draft') {
          console.log(`[Proposals API] Cannot delete ${proposal.status} proposal`);
          return res.status(400).json({ 
            error: 'Only draft proposals can be deleted',
            details: `Cannot delete ${proposal.status} proposals`
          });
        }

        console.log('[Proposals API] Attempting to delete proposal from database');

        // Delete the proposal from the database
        const { error: deleteError } = await supabase
          .from('proposals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Double-check ownership in the delete query

        if (deleteError) {
          console.error('[Proposals API] Supabase delete error:', deleteError);
          console.error('[Proposals API] Delete error details:', {
            message: deleteError.message,
            code: deleteError.code,
            details: deleteError.details,
            hint: deleteError.hint,
            stack: deleteError.stack
          });
          return res.status(500).json({ 
            error: 'Failed to delete proposal',
            details: deleteError.message,
            supabaseError: {
              code: deleteError.code,
              message: deleteError.message,
              details: deleteError.details
            }
          });
        }

        console.log('[Proposals API] Proposal deleted successfully, now deleting versions');

        // Also delete associated proposal versions
        const { error: versionsDeleteError } = await supabase
          .from('proposal_versions')
          .delete()
          .eq('proposal_id', id);

        if (versionsDeleteError) {
          console.error('[Proposals API] Error deleting proposal versions:', versionsDeleteError);
          console.error('[Proposals API] Versions delete error details:', {
            message: versionsDeleteError.message,
            code: versionsDeleteError.code,
            details: versionsDeleteError.details,
            hint: versionsDeleteError.hint
          });
          // Don't fail the request if version deletion fails
        } else {
          console.log('[Proposals API] Proposal versions deleted successfully');
        }

        console.log('[Proposals API] DELETE request completed successfully');
        res.status(200).json({ 
          success: true, 
          message: 'Proposal deleted successfully' 
        });
      } catch (deleteError) {
        console.error('[Proposals API] Error in DELETE operation:', deleteError);
        console.error('[Proposals API] DELETE error details:', {
          message: deleteError.message,
          code: deleteError.code,
          details: deleteError.details,
          hint: deleteError.hint,
          stack: deleteError.stack,
          name: deleteError.name
        });
        throw deleteError;
      }
    }
    // Method not allowed
    else {
      console.log(`[Proposals API] Method ${req.method} not allowed`);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Proposals API] Unexpected error:', error);
    console.error('[Proposals API] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    // Check for specific Supabase error codes
    if (error.code === 'PGRST116') {
      console.log('[Proposals API] PGRST116 error - resource not found');
      res.status(404).json({ error: 'Proposal not found' });
    } else if (error.message && error.message.includes('fetch failed')) {
      console.error('[Proposals API] Network/fetch error detected');
      res.status(500).json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to database. Please check environment variables and network connectivity.',
        originalError: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        errorCode: error.code,
        errorName: error.name
      });
    }
  }
}