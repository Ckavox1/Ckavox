 "use strict";

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const ADMIN_EMAIL = "cedrickkayiranga354@gmail.com";

const BUCKET = "ckavox-media";

const supabaseReady =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR_") &&
    !SUPABASE_KEY.includes("YOUR_");

let db = null;
let currentUser = null;
let allPosts = [];
let activeFilter = "All";
let slideIndex = 0;
let slideTimer = null;

const slides = [
    {
        title: "Discover the latest",
        image:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85"
    },
    {
        title: "Technology & Innovation",
        image:
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85"
    },
    {
        title: "Music & Entertainment",
        image:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85"
    },
    {
        title: "Sports & Global News",
        image:
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=85"
    }
];

function $(id) {
    return document.getElementById(id);
}


// ------------------------------------
// LIVE CLOCK
// ------------------------------------

function updateClock() {
    const now = new Date();

    $("clock").textContent =
        now.toLocaleTimeString("en-GB", {
            hour12: false,
            timeZone: "Africa/Kigali"
        });

    $("date").textContent =
        now.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Africa/Kigali"
        });

    $("year").textContent = now.getFullYear();
}

updateClock();
setInterval(updateClock, 1000);


// ------------------------------------
// MOBILE MENU
// ------------------------------------

$("menuButton").addEventListener("click", () => {
    $("navigation").classList.toggle("open");
});

document.querySelectorAll(".navigation a").forEach(link => {
    link.addEventListener("click", () => {
        $("navigation").classList.remove("open");
    });
});


// ------------------------------------
// SLIDESHOW: EVERY FOUR SECONDS
// ------------------------------------

function showSlide(index) {
    slideIndex = (index + slides.length) % slides.length;

    const slide = slides[slideIndex];

    $("slideImage").src = slide.image;
    $("slideTitle").textContent = slide.title;

    $("slideIndicators").replaceChildren();

    slides.forEach((item, i) => {
        const dot = document.createElement("button");

        dot.className =
            "slide-dot" + (i === slideIndex ? " active" : "");

        dot.setAttribute("aria-label", "Show slide " + (i + 1));

        dot.addEventListener("click", () => {
            showSlide(i);
            restartSlideshow();
        });

        $("slideIndicators").appendChild(dot);
    });
}

function restartSlideshow() {
    clearInterval(slideTimer);

    slideTimer = setInterval(() => {
        showSlide(slideIndex + 1);
    }, 4000);
}

$("previousSlide").addEventListener("click", () => {
    showSlide(slideIndex - 1);
    restartSlideshow();
});

$("nextSlide").addEventListener("click", () => {
    showSlide(slideIndex + 1);
    restartSlideshow();
});

showSlide(0);
restartSlideshow();


// ------------------------------------
// MESSAGE HELPERS
// ------------------------------------

function setMessage(elementId, message, success = false) {
    const el = $(elementId);

    el.textContent = message;

    el.className =
        "status-message " + (success ? "success" : "error");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function validHttpUrl(value) {
    if (!value) return true;

    try {
        const url = new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );
    } catch {
        return false;
    }
}

function safeExternalLink(value) {
    if (!value) return "";

    try {
        const url = new URL(value);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
}

function getShareUrl(post) {
    const url = new URL(window.location.href);

    url.hash = "posts";

    url.searchParams.set("post", post.id);

    return url.href;
}


// ------------------------------------
// SUPABASE INITIALIZATION
// ------------------------------------

function initializeApp() {
    if (!supabaseReady) {
        $("postsGrid").innerHTML = `
            <div class="empty-state">
                <h3>CKAVOX setup required</h3>
                <p>
                    Add your Supabase project URL and public
                    publishable/anon key in script.js.
                </p>
            </div>
        `;

        setMessage(
            "loginMessage",
            "Configure Supabase before signing in."
        );

        return;
    }

    if (!window.supabase) {
        setMessage(
            "loginMessage",
            "Supabase could not load. Check your internet connection."
        );

        return;
    }

    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    loadPublicPosts();
    restoreSession();
}


// ------------------------------------
// ADMIN AUTHENTICATION
// ------------------------------------

$("loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (!db) {
        setMessage(
            "loginMessage",
            "Supabase is not configured."
        );

        return;
    }

    const email = $("adminEmail").value.trim().toLowerCase();
    const password = $("adminPassword").value;

    if (email !== ADMIN_EMAIL.toLowerCase()) {
        setMessage(
            "loginMessage",
            "Access denied. This email is not authorized."
        );

        return;
    }

    setMessage("loginMessage", "Signing in...", true);

    try {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (
            !data.user ||
            data.user.email?.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
        ) {
            await db.auth.signOut();

            throw new Error("Unauthorized administrator.");
        }

        currentUser = data.user;

        showAdminDashboard();
    } catch (error) {
        setMessage(
            "loginMessage",
            error.message || "Unable to sign in."
        );
    }
});


async function restoreSession() {
    if (!db) return;

    try {
        const { data, error } = await db.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (
            session?.user?.email?.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
        ) {
            currentUser = session.user;
            showAdminDashboard();
        } else {
            $("adminDashboard").hidden = true;
            $("loginCard").hidden = false;
        }
    } catch (error) {
        console.error("Session restore failed:", error.message);
    }
}


function showAdminDashboard() {
    $("loginCard").hidden = true;
    $("adminDashboard").hidden = false;

    $("adminIdentity").textContent =
        "Signed in as " + currentUser.email;

    $("adminEmail").value = "";
    $("adminPassword").value = "";

    setMessage("loginMessage", "");

    loadPublicPosts();
}


// Watch for authentication changes
function watchAuthChanges() {
    if (!db) return;

    db.auth.onAuthStateChange((event, session) => {
        if (
            session?.user?.email?.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
        ) {
            currentUser = session.user;

            $("loginCard").hidden = true;
            $("adminDashboard").hidden = false;

            $("adminIdentity").textContent =
                "Signed in as " + currentUser.email;
        } else {
            currentUser = null;

            $("adminDashboard").hidden = true;
            $("loginCard").hidden = false;
        }
    });
}


$("logoutButton").addEventListener("click", async () => {
    if (!db) return;

    const { error } = await db.auth.signOut();

    if (error) {
        alert("Unable to sign out: " + error.message);
        return;
    }

    currentUser = null;

    $("adminDashboard").hidden = true;
    $("loginCard").hidden = false;

    setMessage("loginMessage", "You have signed out.", true);
});


// ------------------------------------
// LOAD PUBLIC POSTS
// ------------------------------------

async function loadPublicPosts() {
    if (!db) return;

    $("postsGrid").innerHTML = `
        <div class="loading-card">Loading posts...</div>
    `;

    const { data, error } = await db
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error(error);

        $("postsGrid").innerHTML = `
            <div class="empty-state">
                Unable to load posts.
                Check your database and internet connection.
            </div>
        `;

        return;
    }

    allPosts = data || [];

    renderPosts();
    renderAdminPosts();
    updatePostCount();

    const requestedPost =
        new URLSearchParams(window.location.search).get("post");

    if (requestedPost) {
        setTimeout(() => {
            const card = document.getElementById(
                "post-" + requestedPost
            );

            if (card) {
                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                card.style.borderColor = "#f5c400";
            }
        }, 100);
    }
}


// ------------------------------------
// RENDER PUBLIC POSTS
// ------------------------------------

function renderPosts() {
    const grid = $("postsGrid");

    const posts = allPosts.filter(post => {
        return (
            activeFilter === "All" ||
            post.category === activeFilter
        );
    });

    if (!posts.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No posts yet</h3>
                <p>Check back soon for new CKAVOX content.</p>
            </div>
        `;

        return;
    }

    grid.replaceChildren();

    posts.forEach(post => {
        const card = document.createElement("article");

        card.className = "post-card";
        card.id = "post-" + post.id;

        const imageUrl = safeExternalLink(post.image_url);
        const contentUrl = safeExternalLink(post.content_url);

        const isVideo = post.category === "Video";

        const media = imageUrl
            ? (
                isVideo
                    ? `
                        <video
                            class="post-media"
                            src="${escapeHTML(imageUrl)}"
                            controls
                            preload="metadata"
                            playsinline>
                        </video>
                    `
                    : `
                        <img
                            class="post-media"
                            src="${escapeHTML(imageUrl)}"
                            alt="${escapeHTML(post.title)}"
                            loading="lazy">
                    `
            )
            : "";

        const openLink = contentUrl
            ? `
                <a href="${escapeHTML(contentUrl)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    Open Content ↗
                </a>
            `
            : "";

        const formattedDate = post.created_at
            ? new Date(post.created_at).toLocaleDateString()
            : "";

        card.innerHTML = `
            ${media}

            <div class="post-body">

                <span class="post-category">
                    ${escapeHTML(post.category)}
                </span>

                <h3>${escapeHTML(post.title)}</h3>

                <p class="post-description">
                    ${escapeHTML(post.description)}
                </p>

                <p class="post-date">
                    ${escapeHTML(formattedDate)}
                </p>

                <div class="post-actions">

                    ${openLink}

                    <button
                        type="button"
                        class="share-button"
                        data-share="${escapeHTML(post.id)}">
                        Share ↗
                    </button>

                </div>

            </div>
        `;

        grid.appendChild(card);
    });

    grid.querySelectorAll("[data-share]").forEach(button => {
        button.addEventListener("click", () => {
            const post = allPosts.find(
                item => item.id === button.dataset.share
            );

            if (post) openShareDialog(post);
        });
    });
}


// ------------------------------------
// FILTER POSTS
// ------------------------------------

document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;

        document.querySelectorAll("[data-filter]").forEach(item => {
            item.classList.toggle(
                "active",
                item === button
            );
        });

        renderPosts();
    });
});


// ------------------------------------
// SHARE LINKS
// ------------------------------------

function openShareDialog(post) {
    const shareUrl = getShareUrl(post);

    $("shareLink").value = shareUrl;

    $("whatsappShare").href =
        "https://wa.me/?text=" +
        encodeURIComponent(post.title + " - " + shareUrl);

    $("shareModal").hidden = false;
}

function closeShareDialog() {
    $("shareModal").hidden = true;
}

$("closeShare").addEventListener("click", closeShareDialog);

$("shareModal").addEventListener("click", event => {
    if (event.target === $("shareModal")) {
        closeShareDialog();
    }
});

$("copyShareLink").addEventListener("click", async () => {
    const link = $("shareLink").value;

    try {
        await navigator.clipboard.writeText(link);

        $("copyShareLink").textContent = "Copied!";

        setTimeout(() => {
            $("copyShareLink").textContent = "Copy Link";
        }, 2000);
    } catch {
        $("shareLink").focus();
        $("shareLink").select();

        const copied = document.execCommand("copy");

        alert(
            copied
                ? "Link copied."
                : "Copy the selected link manually."
        );
    }
});


// ------------------------------------
// ADMIN: UPLOAD FILES
// ------------------------------------

async function uploadMedia(file) {
    if (!file) return "";

    if (!currentUser || !db) {
        throw new Error("Admin login required.");
    }

    if (file.size > 50 * 1024 * 1024) {
        throw new Error("File must not exceed 50 MB.");
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Unsupported file format.");
    }

    const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

    const filePath =
        Date.now() + "-" +
        crypto.randomUUID() + "-" +
        safeName;

    const { data, error } = await db.storage
        .from(BUCKET)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
        });

    if (error) throw error;

    const { data: publicData } = db.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

    return publicData.publicUrl;
}


// ------------------------------------
// ADMIN: PUBLISH CONTENT
// ------------------------------------

$("postForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (
        !db ||
        !currentUser ||
        currentUser.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
    ) {
        setMessage(
            "publishMessage",
            "Only the authorized administrator can publish."
        );

        return;
    }

    const title = $("postTitle").value.trim();

    const category = $("postCategory").value;

    const description = $("postDescription").value.trim();

    const imageUrl = $("postImageUrl").value.trim();

    const contentUrl = $("postContentUrl").value.trim();

    const file = $("postImage").files[0];

    if (!title) {
        setMessage("publishMessage", "Enter a content title.");
        return;
    }

    if (!validHttpUrl(imageUrl) || !validHttpUrl(contentUrl)) {
        setMessage(
            "publishMessage",
            "Links must begin with https:// or http://."
        );

        return;
    }

    const button = $("publishButton");

    button.disabled = true;
    button.textContent = "Publishing...";

    setMessage("publishMessage", "Publishing content...", true);

    try {
        let uploadedUrl = imageUrl;

        if (file) {
            uploadedUrl = await uploadMedia(file);
        }

        if (!uploadedUrl && !contentUrl && !description) {
            throw new Error(
                "Add a description, media file or content link."
            );
        }

        const { error } = await db
            .from("posts")
            .insert({
                title,
                category,
                description,
                image_url: uploadedUrl,
                content_url: contentUrl
            });

        if (error) throw error;

        $("postForm").reset();

        setMessage(
            "publishMessage",
            "Content published successfully!",
            true
        );

        await loadPublicPosts();

        $("posts").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error(error);

        setMessage(
            "publishMessage",
            error.message || "Unable to publish content."
        );
    } finally {
        button.disabled = false;
        button.textContent = "Publish Content";
    }
});


// ------------------------------------
// ADMIN: MANAGE AND DELETE POSTS
// ------------------------------------

function renderAdminPosts() {
    const container = $("adminPostsList");

    if (!container) return;

    if (!currentUser) {
        container.textContent = "Sign in to manage posts.";
        return;
    }

    if (!allPosts.length) {
        container.textContent = "No published posts yet.";
        return;
    }

    container.replaceChildren();

    allPosts.forEach(post => {
        const row = document.createElement("div");

        row.className = "admin-post-row";

        const info = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = post.title;

        const category = document.createElement("p");
        category.textContent = post.category;

        info.append(title, category);

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                'Delete "' + post.title + '"?'
            );

            if (!confirmed) return;

            deleteButton.disabled = true;

            try {
                const { error } = await db
                    .from("posts")
                    .delete()
                    .eq("id", post.id);

                if (error) throw error;

                await loadPublicPosts();

            } catch (error) {
                alert("Delete failed: " + error.message);
                deleteButton.disabled = false;
            }
        });

        row.append(info, deleteButton);

        container.appendChild(row);
    });
}


function updatePostCount() {
    $("postCount").textContent = String(allPosts.length);
}


// ------------------------------------
// START APP
// ------------------------------------

initializeApp();
