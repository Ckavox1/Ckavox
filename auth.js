const SUPABASE_URL = "ZAWE_SUPABASE_URL";
const SUPABASE_ANON_KEY = "ZAWE_SUPABASE_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Kwinjira byanze: " + error.message);
    } else {
        // Niba bishobotse, bahite bajya kuri Admin Dashboard
        window.location.href = "admin.html";
    }
});
