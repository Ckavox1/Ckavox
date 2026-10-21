 // ============================================
// CKAVOX WEBSITE JAVASCRIPT
// Slider + Live Clock + Supabase + Search
// ============================================

"use strict";

// -----------------------------
// 1. LIVE CLOCK AND DATE
// -----------------------------

function updateClock() {
    const now = new Date();

    const timeElement = document.getElementById("currentTime");
    const dateElement = document.getElementById("currentDate");
    const yearElement = document.getElementById("footerYear");

    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Kigali",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Kigali",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    if (timeElement) {
        timeElement.textContent = timeFormatter.format(now);
    }

    if (dateElement) {
        dateElement.textContent = dateFormatter.format(now);
    }

    if (yearElement) {
        yearElement.textContent = new Intl.DateTimeFormat("en", {
            timeZone: "Africa/Kigali",
            year: "numeric"
        }).format(now);
    }
}

updateClock();
setInterval(updateClock, 1000);


// -----------------------------
// 2. HERO SLIDER
// -----------------------------

const heroSlides = Array.from(
    document.querySelectorAll(".hero-slide")
);

const sliderDots = document.getElementById("sliderDots");

let currentSlide = 0;
let slideInterval = null;

function buildSliderDots() {
    if (!sliderDots) return;

    sliderDots.replaceChildren();

    heroSlides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.className = "slider-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Show slide ${index + 1}`);

        dot.addEventListener("click", () => {
            showSlide(index);
            restartSlider();
        });

        sliderDots.appendChild(dot);
    });
}

function showSlide(index) {
    if (!heroSlides.length) return;

    currentSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === currentSlide);
        slide.setAttribute(
            "aria-hidden",
            slideIndex === currentSlide ? "false" : "true"
        );
    });

    if (sliderDots) {
        Array.from(sliderDots.children).forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

function restartSlider() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }

    slideInterval = setInterval(nextSlide, 4000);
}

document.getElementById("nextSlide")
    ?.addEventListener("click", () => {
        nextSlide();
        restartSlider();
    });

document.getElementById("prevSlide")
    ?.addEventListener("click", () => {
        previousSlide();
        restartSlider();
    });

buildSliderDots();
showSlide(0);
restartSlider();


// -----------------------------
// 3. MOBILE MENU
// -----------------------------

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
    });
});


// -----------------------------
// 4. CKAVOX CONTENT DATABASE
// -----------------------------

let allContent = [];

const categoryContainers = {
    movie: "moviesContainer",
    music: "musicContainer",
    news: "newsContainer",
    sports: "sportsContainer",
    showbiz: "showbizContainer",
    photo: "photosContainer"
};

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function getExternalUrl(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return parsed.href;
        }
    } catch (error) {
        return null;
    }

    return null;
}


// -----------------------------
// 5. RECORD CONTENT EVENTS
// -----------------------------

async function recordEvent(contentId, eventType) {
    if (!window.supabaseClient) return;

    try {
        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        const { error } = await supabaseClient
            .from("content_events")
            .insert({
                content_id: contentId,
                user_id: user?.id ?? null,
                event_type: eventType
            });

        if (error) {
            console.warn("Analytics event was not saved:", error.message);
        }
    } catch (error) {
        console.warn("Analytics unavailable.");
    }
}


// -----------------------------
// 6. CONTENT CARDS
// -----------------------------

function createContentCard(item) {
    const card = makeElement("article", "content-card");

    const image = document.createElement("img");

    image.src = item.image_url ||
        "https://placehold.co/800x500/151515/f5c400?text=CKAVOX";

    image.alt = item.title || "CKAVOX content";
    image.loading = "lazy";
    image.decoding = "async";

    image.onerror = () => {
        image.onerror = null;
        image.src =
            "https://placehold.co/800x500/151515/f5c400?text=CKAVOX";
    };

    const title = makeElement("h3", "", item.title);

    const category = makeElement(
        "p",
        "content-category",
        item.category || ""
    );

    card.append(image, title, category);

    if (item.description) {
        card.appendChild(
            makeElement("p", "", item.description)
        );
    }

    const mediaUrl = getExternalUrl(item.media_url);

    if (mediaUrl && item.type === "music") {
        const audio = document.createElement("audio");

        audio.controls = true;
        audio.preload = "none";
        audio.src = mediaUrl;

        let recorded = false;

        audio.addEventListener("play", () => {
            if (!recorded) {
                recorded = true;
                recordEvent(item.id, "play");
            }
        });

        card.appendChild(audio);
    }

    if (mediaUrl && item.type === "movie") {
        const video = document.createElement("video");

        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        video.src = mediaUrl;

        let recorded = false;

        video.addEventListener("play", () => {
            if (!recorded) {
                recorded = true;
                recordEvent(item.id, "play");
            }
        });

        card.appendChild(video);
    }

    const externalUrl = getExternalUrl(item.external_url);

    if (externalUrl) {
        const link = document.createElement("a");

        link.href = externalUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Watch / Read More";

        card.appendChild(link);
    }

    const detailsButton = document.createElement("button");

    detailsButton.type = "button";
    detailsButton.textContent = "View Details";

    detailsButton.addEventListener("click", () => {
        recordEvent(item.id, "view");

        const details = [
            item.title,
            item.category,
            item.description
        ].filter(Boolean).join("\n\n");

        alert(details);
    });

    card.appendChild(detailsButton);

    return card;
}


// -----------------------------
// 7. RENDER CONTENT CATEGORIES
// -----------------------------

function renderCategory(type, containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.replaceChildren();

    const items = allContent.filter(item => item.type === type);

    if (!items.length) {
        container.appendChild(
            makeElement(
                "p",
                "loading-message",
                "New CKAVOX content coming soon."
            )
        );

        return;
    }

    items.forEach(item => {
        container.appendChild(createContentCard(item));
    });
}

function renderAllCategories() {
    Object.entries(categoryContainers).forEach(([type, id]) => {
        renderCategory(type, id);
    });
}


// -----------------------------
// 8. SEARCH
// -----------------------------

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function searchCKAVOX(query) {
    const normalized = query.trim().toLowerCase();

    return allContent.filter(item => {
        const searchableText = [
            item.title,
            item.category,
            item.description,
            item.type
        ].join(" ").toLowerCase();

        return searchableText.includes(normalized);
    });
}

function renderSearchResults(query) {
    if (!searchResults) return;

    searchResults.replaceChildren();

    if (!query.trim()) return;

    const results = searchCKAVOX(query);

    if (!results.length) {
        searchResults.appendChild(
            makeElement("p", "", "No matching content found.")
        );

        return;
    }

    results.forEach(item => {
        searchResults.appendChild(createContentCard(item));
    });
}

searchInput?.addEventListener("input", event => {
    renderSearchResults(event.target.value);
});


// -----------------------------
// 9. LOAD CONTENT FROM SUPABASE
// -----------------------------

async function loadCKAVOXContent() {
    if (!window.supabaseClient) {
        console.error(
            "Supabase client missing. Check supabase-config.js."
        );

        return;
    }

    const { data, error } = await supabaseClient
        .from("content")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Could not load content:", error.message);
        return;
    }

    allContent = data || [];

    renderAllCategories();
}


// -----------------------------
// 10. ACCOUNT STATUS
// -----------------------------

async function updateLoginStatus() {
    const accountArea = document.getElementById("accountArea");

    if (!accountArea || !window.supabaseClient) return;

    const { data: { user }, error } =
        await supabaseClient.auth.getUser();

    accountArea.replaceChildren();

    if (error || !user) {
        const signup = makeElement("a", "btn btn-yellow", "Sign Up");
        signup.href = "login.html";

        const login = makeElement("a", "btn btn-outline", "Login");
        login.href = "login.html";

        accountArea.append(signup, login);
        return;
    }

    const email = makeElement(
        "span",
        "account-email",
        user.email || "My Account"
    );

    email.style.color = "#f5c400";

    const logout = makeElement("button", "btn btn-outline", "Logout");
    logout.type = "button";

    logout.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            alert("Could not sign out. Please try again.");
            return;
        }

        window.location.reload();
    });

    accountArea.append(email, logout);
}


// -----------------------------
// 11. START WEBSITE
// -----------------------------

document.addEventListener("DOMContentLoaded", async () => {
    updateClock();

    await Promise.all([
        loadCKAVOXContent(),
        updateLoginStatus()
    ]);
});
