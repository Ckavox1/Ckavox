 let currentFormType = 'login';

// Gufungura no gufunga ifomu ya Sign Up / Login
function toggleAuthForm(type) {
    currentFormType = type;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('form-title');
    const btn = document.getElementById('btn-action');
    
    title.innerText = type === 'signup' ? 'Create Account' : 'Welcome Back';
    btn.innerText = type === 'signup' ? 'Sign Up' : 'Log In';
    
    modal.style.display = 'flex';
}

function closeAuthForm() {
    document.getElementById('auth-modal').style.style.display = 'none';
}

// Iyo umuntu amaze gufata neza imyirondoro ye akanda Login
function handleAuth(event) {
    event.preventDefault();
    closeAuthForm();
    
    // Guhindura ibiri kuri Webpage kugira ngo itandukane n'iya mbere
    document.querySelector('.auth-buttons').innerHTML = `
        <span style="color: #ffcc00; font-weight: bold; margin-right: 15px;">🟢 Connected</span>
        <button class="btn-login" onclick="location.reload()">Logout</button>
    `;
    
    loadPremiumContent();
}

// Kuzana amafoto meza y'ukuri (HD) n'indirimbo/filime nyazo mu rubuga rwa kabiri
function loadPremiumContent() {
    const gallery = document.getElementById('movies-gallery');
    gallery.classList.remove('locked');
    
    // Hano harimo amafoto nyayo yo kuri Unsplash afite resolution nziza
    const realData = [
        {
            title: "Avatar: The Way of Water",
            genre: "Sci-fi / Action",
            img: "https://unsplash.com"
        },
        {
            title: "Inception",
            genre: "Thriller / Action",
            img: "https://unsplash.com"
        },
        {
            title: "Blinding Lights - The Weeknd",
            genre: "Synth-pop Music",
            img: "https://unsplash.com"
        }
    ];
    
    gallery.innerHTML = realData.map(item => `
        <div class="movie-card">
            <img src="${item.img}" alt="${item.title}">
            <div class="movie-info">
                <h4>${item.title}</h4>
                <p>${item.genre}</p>
            </div>
        </div>
    `).join('');
}
