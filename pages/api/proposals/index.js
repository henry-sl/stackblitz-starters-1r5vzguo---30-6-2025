// pages/api/proposals/index.js
// API endpoint for listing all proposals
// Returns all proposals from the in-memory store

import { getAllProposals } from '../../../lib/store';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all proposals from the store
    const proposals = getAllProposals();
    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
}