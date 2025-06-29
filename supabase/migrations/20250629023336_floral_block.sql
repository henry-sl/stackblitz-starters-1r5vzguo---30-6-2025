/*
  # Add unique constraint to companies.user_id

  1. Changes
    - Add UNIQUE constraint to user_id column in companies table
    - This allows upsert operations to work correctly for company profiles

  2. Security
    - Maintains existing RLS policies
    - Ensures each user can only have one company profile
*/

-- Add unique constraint to user_id column in companies table
ALTER TABLE companies ADD CONSTRAINT companies_user_id_unique UNIQUE (user_id);