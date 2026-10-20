 // --- MOVING SCREEN: REFA FILIME BURI MASEGONDA 4 ---
let currentMovieIndex = 0;
const movieSlides = document.querySelectorAll('.movie-slide');
let movieInterval = setInterval(nextMovieSlide, 4000); // Amasegonda 4

function showMovieSlide(index) {
    movieSlides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= movieSlides.length) { currentMovieIndex = 0; }
    else if (index < 0) { currentMovieIndex = movieSlides.length - 1; }
    else { currentMovieIndex = index; }
    
    movieSlides[currentMovieIndex].classList.add('active');
}

function nextMovieSlide() {
    showMovieSlide(currentMovieIndex + 1);
}

// Amabuto yo gukanda Next cyangwa Prev
function moveMovieSlide(direction) {
    clearInterval(movieInterval); // Guhagarika auto-scroll
    showMovieSlide(currentMovieIndex + direction);
    movieInterval = setInterval(nextMovieSlide, 4000); // Yongere itangire buri masegonda 4
}


// --- MODAL CONTROLS ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }


// --- ADMIN LOGIN ---
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    if (email === 'admin@ckavox.com' && pass === 'adminckavox123') {
        alert('Ubegeye neza CKAVOX Admin!');
        document.getElementById('admin-dashboard').style.display = 'block';
        closeModal('login-modal');
    } else {
        alert('Email cyangwa Password ntabwo ari zo za Admin! Mwinjiye nka user usanzwe.');
        closeModal('login-modal');
    }
}

function logoutAdmin() {
    document.getElementById('admin-dashboard').style.display = 'none';
    alert('Uvuye mu buryo bwa Admin.');
}


// --- PASSWORD RECOVERY (EMAIL OR NUMBER) ---
function handleRecovery(event) {
    event.preventDefault();
    const userInput = document.getElementById('recovery-input').value;
    alert('Code yo kugarura password yawe yohererejwe kuri: ' + userInput + '. Reba muri Email cyangwa SMS hafi yawe.');
    closeModal('recovery-modal');
}


// --- ADMIN POSTING CONTENT ---
function addContentByAdmin() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    const imgUrl = document.getElementById('content-img').value || 'https://placeholder.com';

    if (!title) { alert('Andika izina ry\'ikintu!'); return; }

    if (type === 'news') {
        document.getElementById('admin-news-section').innerHTML += `
            <div class="news-item" style="margin-top:10px;">
                <img src="${imgUrl}" alt="News" style="width:80px; border-radius:4px;">
                <p>${title}</p>
            </div>`;
    } else if (type === 'movie') {
        document.getElementById('admin-movie-section').innerHTML += `
            <div class="news-item" style="margin-top:10px; display:flex; gap:10px; background:#222; padding:5px; border-radius:4px;">
                <img src="${imgUrl}" alt="Film" style="width:50px; height:70px; object-fit:cover;">
                <p style="font-size:0.8rem;">${title} (Yashyizweho n'Admin)</p>
            </div>`;
    } else if (type === 'music') {
        document.getElementById('admin-music-section').innerHTML += `<p><i class="fas fa-play-circle"></i> ${title} &bull; play</p>`;
    }

    alert('Gushyiraho ' + title + ' byajemo neza!');
    document.getElementById('content-title').value = '';
    document.getElementById('content-img').value = '';
}
