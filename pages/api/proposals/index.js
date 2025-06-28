// pages/api/proposals/index.js
// API endpoint for listing all proposals from Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Get all proposals for the authenticated user from Supabase
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return res.status(500).json({ error: 'Failed to fetch proposals' });
    }

    // Transform the data to match the expected format
    const transformedProposals = proposals.map(proposal => ({
      id: proposal.id,
      tenderId: proposal.tender_id,
      tenderTitle: proposal.tender_title,
      content: proposal.content,
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      version: proposal.version
    }));

    res.status(200).json(transformedProposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
}