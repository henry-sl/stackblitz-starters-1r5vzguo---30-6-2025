// pages/api/company.js
// This API endpoint handles company profile operations
// It supports GET (retrieve profile) and PUT (update profile) methods

import { getCompanyProfile, updateCompanyProfile } from '../../lib/store';

export default function handler(req, res) {
  // GET request - retrieve company profile
  if (req.method === 'GET') {
    try {
      const profile = getCompanyProfile();
      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      res.status(500).json({ error: 'Failed to fetch company profile' });
    }
  } 
  // PUT request - update company profile
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      const updatedProfile = updateCompanyProfile(updates);
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Error updating company profile:', error);
      res.status(500).json({ error: 'Failed to update company profile' });
    }
  } 
  // Other methods not allowed
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}