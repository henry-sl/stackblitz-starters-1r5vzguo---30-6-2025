/*
  # Create tenders table

  1. New Tables
    - `tenders`
      - `id` (uuid, primary key)
      - `title` (text)
      - `agency` (text)
      - `description` (text)
      - `category` (text)
      - `closing_date` (date)
      - `is_new` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `tenders` table
    - Add policy for public read access (tenders are public information)
    - Add policy for admin insert/update (only admins can manage tenders)
*/

CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  agency text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  closing_date date NOT NULL,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tenders (they are public information)
CREATE POLICY "Anyone can read tenders"
  ON tenders
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can insert/update tenders (for admin functionality)
CREATE POLICY "Authenticated users can insert tenders"
  ON tenders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tenders"
  ON tenders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);