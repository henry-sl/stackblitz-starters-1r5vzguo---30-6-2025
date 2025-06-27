// pages/api/tenders/index.js
// This API endpoint returns a list of all available tenders
// It uses the getAllTenders function from the store module

import { getAllTenders } from '../../../lib/store';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all tenders from the store
    const tenders = getAllTenders();
    res.status(200).json(tenders);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
}