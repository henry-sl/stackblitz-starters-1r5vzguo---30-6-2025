// pages/api/tenders/index.js
// This API endpoint returns a list of all available tenders from Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all tenders from Supabase, ordered by creation date (newest first)
    const { data: tenders, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenders:', error);
      return res.status(500).json({ error: 'Failed to fetch tenders' });
    }

    // Transform the data to match the expected format
    const transformedTenders = tenders.map(tender => ({
      id: tender.id,
      title: tender.title,
      agency: tender.agency,
      description: tender.description,
      category: tender.category,
      closingDate: tender.closing_date,
      isNew: tender.is_new
    }));

    res.status(200).json(transformedTenders);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
}