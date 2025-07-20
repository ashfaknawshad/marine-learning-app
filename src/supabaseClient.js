import { createClient } from '@supabase/supabase-js'

// Get the variables from the Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;