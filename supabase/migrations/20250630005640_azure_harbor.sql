/*
  # Enhanced Company Profile Schema

  1. New Fields
    - Add comprehensive company profile fields for detailed information
    - Support for team structure, certifications, and project history
    - Enhanced experience and capability tracking

  2. Changes
    - Add new columns to companies table for detailed profile management
    - Maintain backward compatibility with existing data

  3. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Add enhanced fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cidb_grade text,
ADD COLUMN IF NOT EXISTS cidb_expiry date,
ADD COLUMN IF NOT EXISTS iso9001 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS iso14001 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ohsas18001 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS contractor_license text,
ADD COLUMN IF NOT EXISTS license_expiry date,
ADD COLUMN IF NOT EXISTS years_in_operation text,
ADD COLUMN IF NOT EXISTS total_projects text,
ADD COLUMN IF NOT EXISTS total_value text,
ADD COLUMN IF NOT EXISTS major_projects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_employees text,
ADD COLUMN IF NOT EXISTS engineers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS supervisors_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS technicians_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS laborers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS key_personnel jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_categories text[],
ADD COLUMN IF NOT EXISTS preferred_locations text[],
ADD COLUMN IF NOT EXISTS budget_range text;

-- Add indexes for new fields that might be queried
CREATE INDEX IF NOT EXISTS idx_companies_cidb_grade ON companies(cidb_grade);
CREATE INDEX IF NOT EXISTS idx_companies_preferred_categories ON companies USING gin(preferred_categories);
CREATE INDEX IF NOT EXISTS idx_companies_preferred_locations ON companies USING gin(preferred_locations);