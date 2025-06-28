/*
  # Create company profiles table

  1. New Tables
    - `company_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `company_name` (text)
      - `registration_number` (text)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `established_year` (text)
      - `cidb_grade` (text)
      - `cidb_expiry` (date)
      - `iso9001` (boolean)
      - `iso14001` (boolean)
      - `ohsas18001` (boolean)
      - `contractor_license` (text)
      - `license_expiry` (date)
      - `years_in_operation` (text)
      - `total_projects` (text)
      - `total_value` (text)
      - `specialties` (jsonb)
      - `major_projects` (jsonb)
      - `total_employees` (text)
      - `engineers` (text)
      - `supervisors` (text)
      - `technicians` (text)
      - `laborers` (text)
      - `key_personnel` (jsonb)
      - `categories` (jsonb)
      - `locations` (jsonb)
      - `budget_range` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `company_profiles` table
    - Add policy for authenticated users to read/write their own profile data
*/

CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text DEFAULT '',
  registration_number text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  established_year text DEFAULT '',
  cidb_grade text DEFAULT '',
  cidb_expiry date,
  iso9001 boolean DEFAULT false,
  iso14001 boolean DEFAULT false,
  ohsas18001 boolean DEFAULT false,
  contractor_license text DEFAULT '',
  license_expiry date,
  years_in_operation text DEFAULT '',
  total_projects text DEFAULT '',
  total_value text DEFAULT '',
  specialties jsonb DEFAULT '[]'::jsonb,
  major_projects jsonb DEFAULT '[]'::jsonb,
  total_employees text DEFAULT '',
  engineers text DEFAULT '',
  supervisors text DEFAULT '',
  technicians text DEFAULT '',
  laborers text DEFAULT '',
  key_personnel jsonb DEFAULT '[]'::jsonb,
  categories jsonb DEFAULT '[]'::jsonb,
  locations jsonb DEFAULT '[]'::jsonb,
  budget_range text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own company profile"
  ON company_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company profile"
  ON company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON company_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON company_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);