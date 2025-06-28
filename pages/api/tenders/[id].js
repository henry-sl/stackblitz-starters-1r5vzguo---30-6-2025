// pages/api/tenders/[id].js
// This API endpoint returns details for a specific tender by ID from Supabase
// Updated to use Supabase instead of local store

import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get tender ID from the URL

  try {
    // Get the tender by ID from Supabase
    const { data: tender, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        return res.status(404).json({ error: 'Tender not found' });
      }
      console.error('Error fetching tender:', error);
      return res.status(500).json({ error: 'Failed to fetch tender' });
    }

    // Transform the data to match the expected format
    const transformedTender = {
      id: tender.id,
      title: tender.title,
      agency: tender.agency,
      description: tender.description,
      category: tender.category,
      closingDate: tender.closing_date,
      isNew: tender.is_new
    };

    res.status(200).json(transformedTender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ error: 'Failed to fetch tender' });
  }
}