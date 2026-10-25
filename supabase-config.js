 // Central configuration parameters for database connections
const SUPABASE_URL = "https://guuppgqreghdxhvkfrqy.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_amajambo_yose_ya_key_yawe_upastengemo";

// Initialize public global client instances accessible across dependencies
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
