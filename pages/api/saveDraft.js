// pages/api/saveDraft.js
// This API endpoint saves updates to a proposal draft in Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../lib/supabaseClient';

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

    // Update the proposal with new content in Supabase
    const { data: updatedProposal, error } = await supabase
      .from('proposals')
      .update({ 
        content,
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
      console.error('Error updating proposal:', error);
      return res.status(500).json({ error: 'Failed to save draft' });
    }

    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
}