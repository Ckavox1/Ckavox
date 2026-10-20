 // --- LOAD DYNAMIC CONTENT FROM LOCAL STORAGE (Aho Admin abika ibintu) ---
document.addEventListener("DOMContentLoaded", () => {
    loadSavedContent();
    startAllSliders();
});

// --- 1. MOVIES HERO SLIDER ---
let currentHeroIndex = 0;
let heroInterval;

function initHeroSlider() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('#hero-dots .dot');
    
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

    window.moveHeroSlide = function(direction) {
        clearInterval(heroInterval);
        showHeroSlide(currentHeroIndex + direction);
        heroInterval = setInterval(() => showHeroSlide(currentHeroIndex + 1), 4000);
    }

    clearInterval(heroInterval);
    heroInterval = setInterval(() => showHeroSlide(currentHeroIndex + 1), 4000);
}

// --- 2. MUSIC SLIDER ---
let currentMusicIndex = 0;
let musicInterval;

function initMusicSlider() {
    const musicSlides = document.querySelectorAll('.music-slide');
    
    function showMusicSlide(index) {
        if(musicSlides.length === 0) return;
        musicSlides.forEach(slide => slide.classList.remove('active'));
        if (index >= musicSlides.length) { currentMusicIndex = 0; }
        else if (index < 0) { currentMusicIndex = musicSlides.length - 1; }
        else { currentMusicIndex = index; }
        musicSlides[currentMusicIndex].classList.add('active');
    }

    window.moveMusicSlide = function(direction) {
        clearInterval(musicInterval);
        showMusicSlide(currentMusicIndex + direction);
        musicInterval = setInterval(() => showMusicSlide(currentMusicIndex + 1), 4000);
    }

    clearInterval(musicInterval);
    musicInterval = setInterval(() => showMusicSlide(currentMusicIndex + 1), 4000);
}

// --- 3. NEWS / SHOWBIZ SLIDER ---
let currentNewsIndex = 0;
let newsInterval;

function initNewsSlider() {
    const newsSlides = document.querySelectorAll('.news-slide');
    
    function showNewsSlide(index) {
        if(newsSlides.length === 0) return;
        newsSlides.forEach(slide => slide.classList.remove('active'));
        if (index >= newsSlides.length) { currentNewsIndex = 0; }
        else if (index < 0) { currentNewsIndex = newsSlides.length - 1; }
        else { currentNewsIndex = index; }
        newsSlides[currentNewsIndex].classList.add('active');
    }

    window.moveNewsSlide = function(direction) {
        clearInterval(newsInterval);
        showNewsSlide(currentNewsIndex + direction);
        newsInterval = setInterval(() => showNewsSlide(currentNewsIndex + 1), 4000);
    }

    clearInterval(newsInterval);
    newsInterval = setInterval(() => showNewsSlide(currentNewsIndex + 1), 4000);
}

function startAllSliders() {
    initHeroSlider();
    initMusicSlider();
    initNewsSlider();
}

// --- MODALS SYSTEM ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- ADMIN SECURITY LOGIN ---
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    if (email === 'admin@ckavox.com' && pass === 'adminckavox123') {
        alert('Welcome Back Admin wa CKAVOX!');
        document.getElementById('admin-dashboard').style.display = 'block';
        closeModal('login-modal');
    } else {
        alert('Mwinjiye nka User usanzwe. Nta burenganzira bwo guhindura urubuga mufite.');
        closeModal('login-modal');
    }
}
function logoutAdmin() { document.getElementById('admin-dashboard').style.display = 'none'; }

// --- ADMIN DYNAMIC ADD CONTENT (Bidasabye guhindura Code) ---
function addContentByAdmin() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    const desc = document.getElementById('content-desc').value || '';
    const imgUrl = document.getElementById('content-img').value || 'https://picsum.photos';

    if (!title) { alert('Andika izina ry\'ikintu!'); return; }

    const newItem = { type, title, desc, imgUrl };
    let savedItems = JSON.parse(localStorage.getItem('ckavox_content')) || [];
    savedItems.push(newItem);
    localStorage.setItem('ckavox_content', JSON.stringify(savedItems));

    alert(title + ' Yashyizweho ku rubuga neza!');
    
    // Gufunga no guhita twizihiza up-to-date content
    location.reload();
}

function loadSavedContent() {
    const savedItems = JSON.parse(localStorage.getItem('ckavox_content')) || [];
    
    savedItems.forEach(item => {
        if (item.type === 'movie') {
            const container = document.getElementById('movies-slider-target');
            const dotsContainer = document.getElementById('hero-dots');
            
            container.innerHTML += `
                <div class="hero-slide">
                    <div class="slide-bg" style="background-image: linear-gradient(rgba(0,0,0,0.2), #050505), url('${item.imgUrl}');"></div>
                    <span class="featured-badge">ADDED BY ADMIN</span>
                    <div class="hero-content">
                        <div class="poster-side">
                            <img src="${item.imgUrl}" alt="${item.title}">
                        </div>
                        <div class="details-side">
                            <h1>${item.title}</h1>
                            <p class="movie-description">${item.desc}</p>
                            <button class="watch-btn"><i class="fas fa-play"></i> Watch Now</button>
                        </div>
                    </div>
                </div>`;
            dotsContainer.innerHTML += `<span class="dot"></span>`;
            
        } else if (item.type === 'music') {
            document.getElementById('music-slider-target').innerHTML += `
                <div class="music-slide">
                    <img src="${item.imgUrl}" alt="${item.title}">
                    <div class="slide-tag-text">${item.title} &bull; ${item.desc}</div>
                </div>`;
        } else if (item.type === 'news') {
            document.getElementById('news-slider-target').innerHTML += `
                <div class="news-slide">
                    <img src="${item.imgUrl}" alt="${item.title}">
                    <div class="slide-tag-text">${item.title} &bull; ${item.desc}</div>
                </div>`;
        }
    });
}
