// CKAVOX Supabase Configuration

const SUPABASE_URL = "SHYIRAMO_PROJECT_URL_YAWE";
const SUPABASE_ANON_KEY = "SHYIRAMO_PUBLISHABLE_KEY_YAWE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
