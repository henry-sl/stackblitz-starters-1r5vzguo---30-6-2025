// pages/api/proposals/[id].js
// This API endpoint retrieves a specific proposal by ID
// It uses the getProposalById function from the store module

import { getProposalById } from '../../../lib/store';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get proposal ID from the URL

  try {
    // Get the proposal by ID
    const proposal = getProposalById(id);
    
    // Return 404 if proposal not found
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Return the proposal data
    res.status(200).json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
}