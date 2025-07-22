// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("CRITICAL ERROR: Supabase environment variables are not defined. Check your .env.local file and ensure the dev server was restarted.");
}

// THE FIX: Add the 'export' keyword here to create a named export.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// REMOVE THE OLD LINE: 'export default supabase;' is no longer needed.