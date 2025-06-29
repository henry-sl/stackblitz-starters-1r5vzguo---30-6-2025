// pages/api/tenders/index.js
// API endpoint for listing all active tenders from Supabase database

import { createClient } from '@supabase/supabase-js';
import { tenderOperations } from '../../../lib/database';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Tenders API] Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all active tenders
    const tenders = await tenderOperations.getAll(supabase);
    
    // Transform data to match frontend expectations (snake_case to camelCase)
    const transformedTenders = tenders.map(tender => ({
      id: tender.id,
      title: tender.title,
      description: tender.description,
      agency: tender.agency,
      category: tender.category,
      location: tender.location,
      budget: tender.budget,
      closingDate: tender.closing_date,
      publishedDate: tender.published_date,
      tenderId: tender.tender_id,
      requirements: tender.requirements,
      documents: tender.documents,
      contactInfo: tender.contact_info,
      status: tender.status,
      tags: tender.tags,
      isNew: tender.is_featured || false, // Map is_featured to isNew for compatibility
      createdAt: tender.created_at,
      updatedAt: tender.updated_at
    }));

    res.status(200).json(transformedTenders);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
}