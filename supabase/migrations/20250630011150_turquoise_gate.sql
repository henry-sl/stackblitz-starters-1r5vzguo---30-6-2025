/*
  # Add verification status to companies table

  1. Changes
    - Add verification_status column to companies table
    - Add custom_certifications column for dynamic certifications
    - Add document_uploads column for file metadata

  2. Security
    - Maintains existing RLS policies
    - Adds default verification status as 'pending'
*/

-- Add verification status and additional fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS custom_certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS document_uploads jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for verification status
ALTER TABLE companies 
ADD CONSTRAINT companies_verification_status_check 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Add index for verification status queries
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON companies(verification_status);

-- Add comments for documentation
COMMENT ON COLUMN companies.verification_status IS 'Verification status: pending, verified, or rejected';
COMMENT ON COLUMN companies.custom_certifications IS 'Array of custom certification objects with name, expiry, and document info';
COMMENT ON COLUMN companies.document_uploads IS 'Object storing file metadata for uploaded documents';