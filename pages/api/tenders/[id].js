// pages/api/tenders/[id].js
// This API endpoint returns details for a specific tender by ID
// It uses the getTenderById function from the store module

import { getTenderById } from '../../../lib/store';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get tender ID from the URL

  try {
    // Get the tender by ID
    const tender = getTenderById(id);
    
    // Return 404 if tender not found
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Return the tender data
    res.status(200).json(tender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ error: 'Failed to fetch tender' });
  }
}