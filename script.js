"use strict";

document.addEventListener("DOMContentLoaded", () => {
    loadSavedContent();
    initAllSliders();
    setupModals();
    setupDemoForms();

    document.getElementById("current-year").textContent =
        new Date().getFullYear();
});

/*
 * IMPORTANT:
 * This is a front-end demonstration only.
 * localStorage is not a shared database or secure authentication.
 */

const STORAGE_KEY = "ckavox_content_v2";

const sliderStates = {};

function getSlides(container) {
    return Array.from(
        container.querySelectorAll(
            ":scope > .hero-slide, " +
            ":scope > .music-slide, " +
            ":scope > .news-slide"
        )
    );
}

function initSlider(containerId, dotsId = null) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const slides = getSlides(container);
    const dotsContainer = dotsId
        ? document.getElementById(dotsId)
        : null;

    if (slides.length === 0) return;

    let index = Math.max(
        0,
        slides.findIndex(slide => slide.classList.contains("active"))
    );

    function renderDots() {
        if (!dotsContainer) return;

        dotsContainer.replaceChildren();

        slides.forEach((slide, slideIndex) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className =
                slideIndex === index ? "dot active" : "dot";

            dot.setAttribute(
                "aria-label",
                `Go to slide ${slideIndex + 1}`
            );

            dot.addEventListener("click", () => {
                show(slideIndex);
                restart();
            });

            dotsContainer.appendChild(dot);
        });
    }

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;

            slide.classList.toggle("active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });

        if (dotsContainer) {
            Array.from(dotsContainer.children).forEach(
                (dot, dotIndex) => {
                    dot.classList.toggle(
                        "active",
                        dotIndex === index
                    );
                }
            );
        }
    }

    function restart() {
        clearInterval(sliderStates[containerId]);

        if (slides.length > 1) {
            sliderStates[containerId] = setInterval(() => {
                show(index + 1);
            }, 4000);
        }
    }

    show(index);
    renderDots();
    restart();

    return {
        next: () => {
            show(index + 1);
            restart();
        },

        previous: () => {
            show(index - 1);
            restart();
        }
    };
}

function initAllSliders() {
    const hero = initSlider("movies-slider-target", "hero-dots");
    const music = initSlider("music-slider-target");
    const news = initSlider("news-slider-target");

    window.moveHeroSlide = direction => {
        if (!hero) return;

        direction > 0 ? hero.next() : hero.previous();
    };

    window.moveMusicSlide = direction => {
        if (!music) return;

        direction > 0 ? music.next() : music.previous();
    };

    window.moveNewsSlide = direction => {
        if (!news) return;

        direction > 0 ? news.next() : news.previous();
    };
}

/* MODALS */

function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = "none";
    }
}

function setupModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            });
        }
    });
}

window.openModal = openModal;
window.closeModal = closeModal;

/* SAFE LOCAL STORAGE HELPERS */

function getSavedItems() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        const parsed = value ? JSON.parse(value) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not read CKAVOX content:", error);
        return [];
    }
}

function saveItems(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error("Could not save CKAVOX content:", error);

        alert("Amakuru ntiyabitswe. Reba ububiko bwa browser yawe.");
        return false;
    }
}

/* IMAGE VALIDATION */

function isAllowedImageUrl(value) {
    try {
        const url = new URL(value);

        return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
}

/* SAFE ELEMENT CREATION */

function createImage(url, title, className) {
    const image = document.createElement("img");

    image.src = url;
    image.alt = title;
    image.className = className;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";

    image.addEventListener("error", () => {
        image.style.display = "none";
    });

    return image;
}

function createCategory(text) {
    const badge = document.createElement("span");

    badge.className = "featured-badge";
    badge.textContent = text;

    return badge;
}

/* LOAD SAVED CONTENT */

function loadSavedContent() {
    const savedItems = getSavedItems();

    const containers = {
        movie: document.getElementById("movies-slider-target"),
        music: document.getElementById("music-slider-target"),
        news: document.getElementById("news-slider-target")
    };

    savedItems.forEach(item => {
        if (
            !item ||
            !containers[item.type] ||
            !item.title ||
            !isAllowedImageUrl(item.imgUrl)
        ) {
            return;
        }

        const slide = document.createElement("article");

        slide.className =
            item.type === "movie"
                ? "hero-slide"
                : item.type === "music"
                    ? "music-slide"
                    : "news-slide";

        if (item.type === "movie") {
            const image = createImage(
                item.imgUrl,
                item.title,
                "hero-image"
            );

            const overlay = document.createElement("div");
            overlay.className = "hero-overlay";

            const content = document.createElement("div");
            content.className = "hero-content";

            const details = document.createElement("div");
            details.className = "details-side";

            const category = document.createElement("p");
            category.className = "eyebrow";
            category.textContent = "CKAVOX FEATURED";

            const title = document.createElement("h1");
            title.textContent = item.title;

            const description = document.createElement("p");
            description.className = "movie-description";
            description.textContent = item.desc || "";

            details.append(category, title, description);
            content.append(details);

            slide.append(
                image,
                overlay,
                createCategory("ADDED CONTENT"),
                content
            );
        } else {
            const image = createImage(
                item.imgUrl,
                item.title,
                ""
            );

            const textBox = document.createElement("div");
            textBox.className = "slide-tag-text";

            const category = document.createElement("span");
            category.className = "content-category";
            category.textContent =
                item.type === "music" ? "MUSIC" : "NEWS & SHOWBIZ";

            const title = document.createElement("h3");
            title.textContent = item.title;

            const description = document.createElement("p");
            description.textContent = item.desc || "";

            textBox.append(category, title, description);
            slide.append(image, textBox);
        }

        containers[item.type].appendChild(slide);
    });
}

/* ADMIN DEMO */

function addContentByAdmin(event) {
    if (event) {
        event.preventDefault();
    }

    const type = document.getElementById("content-type").value;
    const title = document.getElementById("content-title").value.trim();
    const desc = document.getElementById("content-desc").value.trim();
    const imgUrl = document.getElementById("content-img").value.trim();

    if (!["movie", "music", "news"].includes(type)) {
        alert("Hitamo ubwoko bw'amakuru bwemewe.");
        return;
    }

    if (!title) {
        alert("Andika umutwe w'amakuru.");
        return;
    }

    if (!isAllowedImageUrl(imgUrl)) {
        alert("Shyiramo URL y'ifoto itangizwa na https://");
        return;
    }

    const savedItems = getSavedItems();

    savedItems.push({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),

        type,
        title,
        desc,
        imgUrl,
        createdAt: new Date().toISOString()
    });

    if (!saveItems(savedItems)) return;

    alert("Amakuru yabitswe muri browser ukoresha.");

    location.reload();
}

function logoutAdmin() {
    document.getElementById("admin-dashboard").hidden = true;
    closeModal("login-modal");
}

window.logoutAdmin = logoutAdmin;

/* DEMO FORMS */

function setupDemoForms() {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        /*
         * No hard-coded administrator password is used.
         * A real login must be implemented using Supabase Auth.
         */

        alert(
            "Login nyakuri ntirashyirwamo. " +
            "Huza Supabase Auth mbere yo gufungura Admin dashboard."
        );
    });

    const signupForm = document.getElementById("signup-form");

    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        alert(
            "Kwiyandikisha nyakuri bisaba guhuza Supabase Auth."
        );
    });

    const adminForm = document.getElementById("admin-content-form");

    adminForm.addEventListener("submit", addContentByAdmin);
}
