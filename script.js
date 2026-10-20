 // --- 1. MOVIES HERO SLIDER (Amasegonda 4) ---
let currentHeroIndex = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('#hero-dots .dot');
let heroInterval = setInterval(() => moveHeroSlide(1), 4000);

function showHeroSlide(index) {
    if(heroSlides.length === 0) return;
    heroSlides.forEach(slide => slide.classList.remove('active'));
    heroDots.forEach(dot => dot.classList.remove('active'));
    
    if (index >= heroSlides.length) { currentHeroIndex = 0; }
    else if (index < 0) { currentHeroIndex = heroSlides.length - 1; }
    else { currentHeroIndex = index; }
    
    heroSlides[currentHeroIndex].classList.add('active');
    if(heroDots[currentHeroIndex]) heroDots[currentHeroIndex].classList.add('active');
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
    if(musicSlides.length === 0) return;
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
    if(sportsSlides.length === 0) return;
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
