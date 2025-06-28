// pages/api/proposals/[id].js
// This API endpoint retrieves a specific proposal by ID from Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get proposal ID from the URL

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

    // Get the proposal by ID from Supabase, ensuring it belongs to the user
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        return res.status(404).json({ error: 'Proposal not found' });
      }
      console.error('Error fetching proposal:', error);
      return res.status(500).json({ error: 'Failed to fetch proposal' });
    }

    // Transform the data to match the expected format
    const transformedProposal = {
      id: proposal.id,
      tenderId: proposal.tender_id,
      tenderTitle: proposal.tender_title,
      content: proposal.content,
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      version: proposal.version
    };

    res.status(200).json(transformedProposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
}