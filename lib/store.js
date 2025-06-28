// lib/store.js
// This file now only contains attestation data as all other data has been migrated to Supabase
// Tenders and proposals are now stored in Supabase database

// Mock attestations for reputation system - simulates blockchain records of submitted proposals
export function getAttestations() {
  return [
    {
      id: 1,
      tenderTitle: 'Smart City Infrastructure Project',
      agency: 'Kuala Lumpur City Council',
      submittedAt: '2024-01-15T10:30:00Z',
      txId: 'ALGO123456789ABCDEF', // Mock blockchain transaction ID
      status: 'submitted'
    },
    {
      id: 2,
      tenderTitle: 'Digital Government Services Platform',
      agency: 'Malaysia Digital Economy Corporation',
      submittedAt: '2024-01-08T14:20:00Z',
      txId: 'ALGO987654321FEDCBA', // Mock blockchain transaction ID
      status: 'submitted'
    }
  ];
}

// NOTE: All other functions have been migrated to Supabase:
// - Tenders are now stored in the 'tenders' table
// - Proposals are now stored in the 'proposals' table  
// - Company profiles are now stored in the 'company_profiles' table
// - All API endpoints have been updated to use Supabase instead of this local store