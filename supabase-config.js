 // Central configuration parameters for database connections
const SUPABASE_URL = "https://guuppgqreghdxhvkfrqy.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_weWwdJqlkdK9ao7CIW0ycg_ihXXJpOL";

// Initialize public global client instances accessible across dependencies
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
