 // 1. Live 24/7 Clock Display Engine
function runLiveClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;
    
    setInterval(() => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight
        const formattedHours = String(hours).padStart(2, '0');
        
        clockElement.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }, 1000);
}

// 2. Local State Management for Slideshow Collections
const slideshowStates = {};

// Default Placeholder HD Resolution Visuals if Database entries are empty
const fallbackImages = [
    "https://unsplash.com", // Sports Default
    "https://unsplash.com", // Film Default
    "https://unsplash.com", // Tech Default
    "https://unsplash.com"  // General Trending Default
];

// 3. Main Data Fetching and Carousel Generation
async function loadCKAVOXContent() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        // Query category posts from Supabase database table
        const { data: posts, error } = await supabase
            .from('ckavox_content')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group individual records by category name fields
        const categories = {};
        const nativeTypes = ['sports', 'film', 'technology', 'trending', 'news'];
        
        // Initialize default arrays to enforce presence of all requested sectors
        nativeTypes.forEach(type => { categories[type] = []; });

        if (posts && posts.length > 0) {
            posts.forEach(post => {
                const cat = post.category ? post.category.toLowerCase().trim() : 'news';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(post);
            });
        }

        container.innerHTML = ''; // Strip existing template skeletal elements

        // Loop over parsed content matrices and render structural components
        Object.keys(categories).forEach(catName => {
            const items = categories[catName];
            
            // Build array of 4 guaranteed image strings
            let imagesArray = [];
            for (let i = 0; i < 4; i++) {
                if (items[i] && items[i].image_url) {
                    imagesArray.push(items[i].image_url);
                } else {
                    imagesArray.push(fallbackImages[i % fallbackImages.length]);
                }
            }

            slideshowStates[catName] = { currentIndex: 0, total: 4 };

            // Generate template wrappers with controls
            const cardHtml = `
                <div class="bg-[#1f2833]/60 rounded-2xl border border-gray-800 overflow-hidden shadow-xl p-5 flex flex-col justify-between">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-black uppercase tracking-widest text-[#00ffff]">${catName} Section</h3>
                        <span class="text-xs bg-[#8a2be2]/40 text-purple-200 font-mono px-3 py-1 rounded-full uppercase tracking-wider">HD Loop</span>
                    </div>

                    <!-- Visual Slider Window Container -->
                    <div class="relative h-56 w-full bg-[#0b0c10] rounded-xl overflow-hidden group">
                        ${imagesArray.map((img, idx) => `
                            <img src="${img}" class="slide-item slide-${catName} absolute inset-0 w-full h-full object-cover ${idx === 0 ? 'active' : ''}" data-index="${idx}" alt="${catName} slide">
                        `).join('')}

                        <!-- Left Control Button -->
                        <button onclick="changeManualSlide('${catName}', -1)" class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#8a2be2] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all opacity-80 group-hover:opacity-100 z-10">❮</button>
                        
                        <!-- Right Control Button -->
                        <button onclick="changeManualSlide('${catName}', 1)" class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#8a2be2] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all opacity-80 group-hover:opacity-100 z-10">❯</button>
                    </div>

                    <div class="mt-4 text-xs text-gray-500 font-medium flex justify-between items-center">
                        <span class="uppercase tracking-widest">Automatic Loop: 4s Intervals</span>
                        <span class="font-mono text-[#00ffff]" id="indicator-${catName}">Slide: 1 / 4</span>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

        // Fire automated slideshow interval timers
        startAutomatedLoops();

    } catch (err) {
        console.error("Critical rendering error:", err.message);
        container.innerHTML = `<p class="text-red-400 text-xs text-center col-span-2 uppercase font-mono">Failed to sync live data updates safely.</p>`;
    }
}

// 4. Manual Carousel Navigational Actions
window.changeManualSlide = function(category, direction) {
    const state = slideshowStates[category];
    if (!state) return;

    const slides = document.querySelectorAll(`.slide-${category}`);
    if (slides.length === 0) return;

    slides[state.currentIndex].classList.remove('active');

    state.currentIndex += direction;
    if (state.currentIndex >= state.total) state.currentIndex = 0;
    if (state.currentIndex < 0) state.currentIndex = state.total - 1;

    slides[state.currentIndex].classList.add('active');

    // Update index trackers
    const indicator = document.getElementById(`indicator-${category}`);
    if (indicator) indicator.textContent = `Slide: ${state.currentIndex + 1} / 4`;
};

// 5. Automated Interval Engines (Every 4 Seconds)
function startAutomatedLoops() {
    Object.keys(slideshowStates).forEach(category => {
        setInterval(() => {
            changeManualSlide(category, 1);
        }, 4000);
    });
}

// Initialization Hooks
document.addEventListener('DOMContentLoaded', () => {
    runLiveClock();
    loadCKAVOXContent();
});
