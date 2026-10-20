// 1. Guhuza urubuga na Supabase Database yawe
const SUPABASE_URL = "ZAWE_SUPABASE_URL"; 
const SUPABASE_ANON_KEY = "ZAWE_SUPABASE_ANON_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Guhamagara Link ziri muri Database no kuzishyira kuri Website
async function loadCkavoxLinks() {
    try {
        const { data, error } = await supabase
            .from('ckavox_content')
            .select('title, link_url');

        if (error) throw error;

        if (data) {
            data.forEach(item => {
                const titleLower = item.title.toLowerCase();
                
                // Niba ari link ya WhatsApp
                if (titleLower.includes('whatsapp')) {
                    const waBtn = document.getElementById('whatsapp-link');
                    if (waBtn) waBtn.href = item.link_url;
                }
                
                // Niba ari link ya Instagram
                if (titleLower.includes('instagram')) {
                    const igBtn = document.getElementById('instagram-link');
                    if (igBtn) igBtn.href = item.link_url;
                }
            });
        }
    } catch (err) {
        console.error("Ibibazo mu guhamagara amadata: ", err.message);
    }
}

// Guhita bikora iyo paji ifungutse
document.addEventListener('DOMContentLoaded', loadCkavoxLinks);
