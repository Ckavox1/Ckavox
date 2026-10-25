 // central configuration parameters for database connections
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-project-anon-key-here";

// Initialize public global client instances accessible across dependencies
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
