// lib/supabaseClient.js
// This file initializes and exports the Supabase client for authentication and database access

import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create and export the Supabase client
// This client will be used throughout the application for authentication and database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)