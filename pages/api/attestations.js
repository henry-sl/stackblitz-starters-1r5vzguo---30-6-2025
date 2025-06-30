// pages/api/attestations.js
// API endpoint for fetching blockchain attestations from Supabase database
// Enhanced with Algorand blockchain verification

import { createClient } from '@supabase/supabase-js';
import { attestationOperations } from '../../lib/database';
import { verifyAttestationTransaction } from '../../lib/algorandTransactions';
import { getExplorerURL } from '../../lib/algorand';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get attestations from the database
    const attestations = await attestationOperations.getByUser(supabase, user.id);
    
    // Transform data to match frontend expectations (snake_case to camelCase)
    const transformedAttestations = await Promise.all(attestations.map(async (attestation) => {
      // Verify transaction on blockchain for both confirmed and pending statuses
      let verificationStatus = attestation.status;
      let explorerUrl = '';
      
      try {
        if (attestation.tx_id && attestation.tx_id !== 'pending' && 
            (attestation.status === 'confirmed' || attestation.status === 'pending')) {
          // Try to verify the transaction on the blockchain
          const isVerified = await verifyAttestationTransaction(attestation.tx_id);
          verificationStatus = isVerified ? 'verified' : 'pending';
        }
        
        // Get explorer URL for the transaction
        if (attestation.tx_id && attestation.tx_id !== 'pending') {
          explorerUrl = getExplorerURL(attestation.tx_id);
        }
      } catch (error) {
        console.error('Error verifying attestation:', error);
        // Don't change verification status if verification fails
      }
      
      return {
        id: attestation.id,
        tenderTitle: attestation.tender_title,
        agency: attestation.agency,
        submittedAt: attestation.submitted_at,
        txId: attestation.tx_id || 'pending',
        status: verificationStatus,
        metadata: attestation.metadata,
        createdAt: attestation.created_at,
        explorerUrl: explorerUrl
      };
    }));

    res.status(200).json(transformedAttestations);
  } catch (error) {
    console.error('Error fetching attestations:', error);
    res.status(500).json({ error: 'Failed to fetch attestations' });
  }
}