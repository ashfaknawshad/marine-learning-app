// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will now appear in your browser's console if the variables are missing.
  throw new Error("CRITICAL ERROR: Supabase environment variables are not defined. Check your .env.local file and ensure the dev server was restarted.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;