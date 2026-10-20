 // --- 1. MOVIES HERO SLIDER (Amasegonda 4) ---
let currentHeroIndex = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('#hero-dots .dot');
let heroInterval = setInterval(() => moveHeroSlide(1), 4000);

function showHeroSlide(index) {
    heroSlides.forEach(slide => slide.classList.remove('active'));
    heroDots.forEach(dot => dot.classList.remove('active'));
    
    if (index >= heroSlides.length) { currentHeroIndex = 0; }
    else if (index < 0) { currentHeroIndex = heroSlides.length - 1; }
    else { currentHeroIndex = index; }
    
    heroSlides[currentHeroIndex].classList.add('active');
    heroDots[currentHeroIndex].classList.add('active');
}

function moveHeroSlide(direction) {
    clearInterval(heroInterval);
    showHeroSlide(currentHeroIndex + direction);
    heroInterval = setInterval(() => moveHeroSlide(1), 4000);
}

// --- 2. MUSIC SLIDER (Amasegonda 4) ---
let currentMusicIndex = 0;
const musicSlides = document.querySelectorAll('.music-slide');
let musicInterval = setInterval(() => moveMusicSlide(1), 4000);

function showMusicSlide(index) {
    musicSlides.forEach(slide => slide.classList.remove('active'));
    if (index >= musicSlides.length) { currentMusicIndex = 0; }
    else if (index < 0) { currentMusicIndex = musicSlides.length - 1; }
    else { currentMusicIndex = index; }
    musicSlides[currentMusicIndex].classList.add('active');
}

function moveMusicSlide(direction) {
    clearInterval(musicInterval);
    showMusicSlide(currentMusicIndex + direction);
    musicInterval = setInterval(() => moveMusicSlide(1), 4000);
}

// --- 3. SPORTS SLIDER (Amasegonda 4) ---
let currentSportsIndex = 0;
const sportsSlides = document.querySelectorAll('.sports-slide');
let sportsInterval = setInterval(() => moveSportsSlide(1), 4000);

function showSportsSlide(index) {
    sportsSlides.forEach(slide => slide.classList.remove('active'));
    if (index >= sportsSlides.length) { currentSportsIndex = 0; }
    else if (index < 0) { currentSportsIndex = sportsSlides.length - 1; }
    else { currentSportsIndex = index; }
    sportsSlides[currentSportsIndex].classList.add('active');
}

function moveSportsSlide(direction) {
    clearInterval(sportsInterval);
    showSportsSlide(currentSportsIndex + direction);
    sportsInterval = setInterval(() => moveSportsSlide(1), 4000);
}

// --- MODAL CONTROLS ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- ADMIN LOGIN & CONTROL ---
function handleLogin(event) {
    event.preventDefault();
    if (document.getElementById('login-email').value === 'admin@ckavox.com' && document.getElementById('login-pass').value === 'adminckavox123') {
        alert('Welcome CKAVOX Admin!');
        document.getElementById('admin-dashboard').style.display = 'block';
        closeModal('login-modal');
    } else {
        alert('Mwinjiye nka User usanzwe.');
        closeModal('login-modal');
    }
}
function logoutAdmin() { document.getElementById('admin-dashboard').style.display = 'none'; }

function handleRecovery() {
    alert('Code yo kugarura password yohererejwe kuri Email/Telefone washyizemo!');
    closeModal('recovery-modal');
}

function addContentByAdmin() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    if (!title) return alert('Andika ikintu!');

    if (type === 'music') {
        document.getElementById('admin-music-section').innerHTML += `<p style="padding:5px; font-size:0.85rem;"><i class="fas fa-play-circle"></i> ${title} &bull; play</p>`;
    } else if (type === 'sports') {
        document.getElementById('admin-sports-section').innerHTML += `
            <div class="match-card" style="margin-top:10px; height:auto; padding:10px;">
                <div class="teams" style="font-size:0.9rem;">${title}</div>
            </div>`;
    }
    alert('Byagenze neza!');
    document.getElementById('content-title').value = '';
}
