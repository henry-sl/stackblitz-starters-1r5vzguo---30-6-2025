// pages/api/attestations.js
// This API endpoint returns blockchain attestations (proofs) for the company
// It uses the getAttestations function from the store module

import { getAttestations } from '../../lib/store';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get attestations from the store
    const attestations = getAttestations();
    res.status(200).json(attestations);
  } catch (error) {
    console.error('Error fetching attestations:', error);
    res.status(500).json({ error: 'Failed to fetch attestations' });
  }
}