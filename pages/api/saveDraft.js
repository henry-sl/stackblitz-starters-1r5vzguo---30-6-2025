// pages/api/saveDraft.js
// This API endpoint saves updates to a proposal draft
// It uses the updateProposal function from the store module

import { updateProposal } from '../../lib/store';

export default function handler(req, res) {
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
    // Update the proposal with new content
    const updatedProposal = updateProposal(proposalId, { 
      content,
      updatedAt: new Date().toISOString()
    });
    
    // Return 404 if proposal not found
    if (!updatedProposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
}