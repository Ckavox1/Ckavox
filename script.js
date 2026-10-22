 /* ===================================
   CKAVOX MAIN JAVASCRIPT
   =================================== */

const $ = (selector) => document.querySelector(selector);

let allPosts = [];
let slides = [];
let currentSlide = 0;
let slideTimer = null;

/* ===================================
   LIVE CLOCK - RWANDA TIME
   =================================== */

function updateClock() {
    const now = new Date();

    const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Kigali",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(now);

    const date = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Kigali",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(now);

    $("#clockTime").textContent = time;
    $("#clockDate").textContent = date;
    $("#clockZone").textContent = "Rwanda Time (CAT, UTC+2)";

    $("#footerYear").textContent = new Intl.DateTimeFormat("en", {
        timeZone: "Africa/Kigali",
        year: "numeric"
    }).format(now);
}

updateClock();
setInterval(updateClock, 1000);

/* ===================================
   SAFE HTML
   =================================== */

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function safeURL(value = "") {
    try {
        const url = new URL(value, window.location.href);

        if (
            url.protocol === "https:" ||
            url.protocol === "http:"
        ) {
            return url.href;
        }
    } catch (error) {}

    return "";
}

/* ===================================
   SLIDESHOW
   =================================== */

async function loadSlides() {
    const container = $("#heroSlides");

    try {
        const { data, error } = await supabaseClient
            .from("ckavox_slides")
            .select("*")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        slides = data || [];

        if (slides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    CKAVOX highlights will appear here
                    when the administrator publishes slides.
                </div>
            `;
            return;
        }

        currentSlide = 0;
        renderSlide();

        clearInterval(slideTimer);

        if (slides.length > 1) {
            slideTimer = setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                renderSlide();
            }, 4000);
        }

    } catch (error) {
        console.error("CKAVOX slideshow error:", error);

        container.innerHTML = `
            <div class="empty-state">
                Unable to load highlights.
                Check the Supabase configuration.
            </div>
        `;
    }
}

function renderSlide() {
    const container = $("#heroSlides");
    const slide = slides[currentSlide];

    if (!slide) return;

    const imageURL = safeURL(slide.image_url);

    const content = `
        <article class="slide-card">
            ${
                imageURL
                ? `<img src="${escapeHTML(imageURL)}"
                        alt="${escapeHTML(slide.title)}"
                        fetchpriority="high">`
                : ""
            }

            <div class="slide-caption">
                <p class="eyebrow">CKAVOX EXCLUSIVE</p>

                <h3>${escapeHTML(slide.title)}</h3>

                <p>${escapeHTML(slide.subtitle || "")}</p>

                ${
                    safeURL(slide.link_url)
                    ? `<a class="content-link"
                         href="${escapeHTML(safeURL(slide.link_url))}"
                         target="_blank"
                         rel="noopener noreferrer">
                         Discover more ↗
                       </a>`
                    : ""
                }
            </div>
        </article>
    `;

    container.innerHTML = content;
}

$("#prevSlide").addEventListener("click", () => {
    if (slides.length < 2) return;

    currentSlide =
        (currentSlide - 1 + slides.length) % slides.length;

    renderSlide();
});

$("#nextSlide").addEventListener("click", () => {
    if (slides.length < 2) return;

    currentSlide = (currentSlide + 1) % slides.length;

    renderSlide();
});

/* ===================================
   LOAD PUBLISHED CONTENT
   =================================== */

async function loadPosts() {
    const container = $("#latestPosts");

    container.innerHTML = `
        <p class="loading">Loading CKAVOX posts...</p>
    `;

    try {
        const { data, error } = await supabaseClient
            .from("ckavox_content")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });

        if (error) throw error;

        allPosts = data || [];

        renderPosts("All");

    } catch (error) {
        console.error("CKAVOX content error:", error);

        container.innerHTML = `
            <p class="empty-state">
                Unable to load posts.
                Please check the Supabase setup.
            </p>
        `;
    }
}

/* ===================================
   RENDER CONTENT CARDS
   =================================== */

function renderPosts(category = "All") {
    const container = $("#latestPosts");

    const filtered = category === "All"
        ? allPosts
        : allPosts.filter(post =>
            post.category.toLowerCase() === category.toLowerCase()
        );

    if (!filtered.length) {
        container.innerHTML = `
            <p class="empty-state">
                No published posts in this category yet.
            </p>
        `;
        return;
    }

    container.innerHTML = filtered.map(post => {
        const image = safeURL(post.image_url);
        const media = safeURL(post.media_url);

        return `
            <article class="content-card">

                ${
                    image
                    ? `<img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(post.title)}"
                        loading="lazy"
                        decoding="async">`
                    : ""
                }

                <div class="content-card-body">

                    <span class="content-category">
                        ${escapeHTML(post.category)}
                    </span>

                    <h3>${escapeHTML(post.title)}</h3>

                    <p>${escapeHTML(post.description || "")}</p>

                    ${
                        media
                        ? `<a class="content-link"
                             href="${escapeHTML(media)}"
                             target="_blank"
                             rel="noopener noreferrer">
                             Open content ↗
                           </a>`
                        : ""
                    }

                </div>

            </article>
        `;
    }).join("");
}

/* ===================================
   CATEGORY FILTERS
   =================================== */

$("#contentFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    renderPosts(button.dataset.category);
});

/* ===================================
   START WEBSITE
   =================================== */

async function startCKAVOX() {
    if (
        !window.supabase ||
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_ANON_KEY === "undefined" ||
        SUPABASE_URL.includes("PASTE_YOUR_") ||
        SUPABASE_ANON_KEY.includes("PASTE_YOUR_")
    ) {
        $("#latestPosts").innerHTML = `
            <p class="empty-state">
                Add your Supabase project URL and publishable key
                to supabase-config.js.
            </p>
        `;

        $("#heroSlides").innerHTML = `
            <p class="empty-state">
                Supabase configuration is required.
            </p>
        `;

        return;
    }

    await Promise.all([
        loadSlides(),
        loadPosts()
    ]);
}

startCKAVOX();
