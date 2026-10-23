 /* ===================================
   CKAVOX ADMIN DASHBOARD
   =================================== */

const byId = id => document.getElementById(id);

const loginPanel = byId("loginPanel");
const dashboard = byId("dashboard");

const loginForm = byId("loginForm");
const contentForm = byId("contentForm");
const slideForm = byId("slideForm");

let currentAdmin = null;
let contentCache = [];
let slideCache = [];

function setMessage(id, message) {
    byId(id).textContent = message;
}

function html(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function validURL(value = "") {
    try {
        const url = new URL(value);

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
   AUTHORIZATION
   =================================== */

async function checkAdmin() {
    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error || !data.session) {
        showLogin();
        return;
    }

    const user = data.session.user;

    if (
        !user.email ||
        user.email.toLowerCase() !==
        CKAVOX_ADMIN_EMAIL.toLowerCase()
    ) {
        await supabaseClient.auth.signOut();

        setMessage(
            "loginMessage",
            "Access denied: this account is not authorized."
        );

        showLogin();
        return;
    }

    currentAdmin = user;

    byId("adminEmail").textContent = user.email;

    showDashboard();

    await refreshDashboard();
}

function showLogin() {
    loginPanel.hidden = false;
    dashboard.hidden = true;
}

function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
}

/* ===================================
   LOGIN
   =================================== */

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    setMessage("loginMessage", "Signing in...");

    const email = byId("email").value.trim();
    const password = byId("password").value;

    if (
        email.toLowerCase() !==
        CKAVOX_ADMIN_EMAIL.toLowerCase()
    ) {
        setMessage(
            "loginMessage",
            "This email is not authorized."
        );
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        setMessage(
            "loginMessage",
            "Login failed. Check your password and Supabase Auth setup."
        );
        return;
    }

    if (
        data.user.email.toLowerCase() !==
        CKAVOX_ADMIN_EMAIL.toLowerCase()
    ) {
        await supabaseClient.auth.signOut();

        setMessage("loginMessage", "Access denied.");

        return;
    }

    currentAdmin = data.user;

    setMessage("loginMessage", "Login successful.");

    await checkAdmin();
});

/* ===================================
   LOGOUT
   =================================== */

byId("logoutButton").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();

    currentAdmin = null;

    showLogin();
});

/* ===================================
   ADMIN SESSION CHANGES
   =================================== */

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
        currentAdmin = null;
        showLogin();
    }
});

/* ===================================
   UPLOAD IMAGE
   =================================== */

async function uploadImage(file) {
    if (!file) return "";

    if (!currentAdmin) {
        throw new Error("Admin login required.");
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Unsupported image type.");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image must be 10 MB or smaller.");
    }

    const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

    const path =
        `${currentAdmin.id}/${Date.now()}-${safeName}`;

    const { error } = await supabaseClient
        .storage
        .from("ckavox-media")
        .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
        });

    if (error) throw error;

    const { data } = supabaseClient
        .storage
        .from("ckavox-media")
        .getPublicUrl(path);

    return data.publicUrl;
}

/* ===================================
   SAVE CONTENT
   =================================== */

contentForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentAdmin) return;

    setMessage("contentMessage", "Saving content...");

    try {
        const id = byId("contentId").value;

        const file = byId("contentImage").files[0];

        let imageURL = byId("imageURL").value.trim();

        if (file) {
            imageURL = await uploadImage(file);
        }

        if (imageURL && !validURL(imageURL)) {
            throw new Error("Enter a valid image URL.");
        }

        const mediaURL = byId("mediaURL").value.trim();

        if (mediaURL && !validURL(mediaURL)) {
            throw new Error("Enter a valid content URL.");
        }

        const record = {
            title: byId("title").value.trim(),
            description: byId("description").value.trim(),
            category: byId("category").value,
            content_type: byId("contentType").value,
            image_url: imageURL,
            media_url: mediaURL,
            published: byId("published").checked,
            updated_at: new Date().toISOString()
        };

        if (!record.title) {
            throw new Error("A title is required.");
        }

        if (id) {
            const { error } = await supabaseClient
                .from("ckavox_content")
                .update(record)
                .eq("id", id);

            if (error) throw error;

            setMessage("contentMessage", "Content updated.");
        } else {
            const { error } = await supabaseClient
                .from("ckavox_content")
                .insert(record);

            if (error) throw error;

            setMessage("contentMessage", "Content created.");
        }

        contentForm.reset();

        byId("contentId").value = "";

        await refreshDashboard();

    } catch (error) {
        console.error(error);

        setMessage(
            "contentMessage",
            error.message || "Unable to save content."
        );
    }
});

/* ===================================
   SAVE SLIDES
   =================================== */

slideForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentAdmin) return;

    setMessage("slideMessage", "Saving slide...");

    try {
        const id = byId("slideId").value;

        const file = byId("slideImage").files[0];

        let imageURL = byId("slideImageURL").value.trim();

        if (file) {
            imageURL = await uploadImage(file);
        }

        if (!validURL(imageURL)) {
            throw new Error("A valid slide image URL is required.");
        }

        const link = byId("slideLink").value.trim();

        if (link && !validURL(link)) {
            throw new Error("Enter a valid destination URL.");
        }

        const record = {
            title: byId("slideTitle").value.trim(),
            subtitle: byId("slideSubtitle").value.trim(),
            image_url: imageURL,
            link_url: link,
            sort_order: Number(byId("slideOrder").value) || 0,
            active: byId("slideActive").checked
        };

        if (!record.title) {
            throw new Error("Slide title is required.");
        }

        let error;

        if (id) {
            ({ error } = await supabaseClient
                .from("ckavox_slides")
                .update(record)
                .eq("id", id));
        } else {
            ({ error } = await supabaseClient
                .from("ckavox_slides")
                .insert(record));
        }

        if (error) throw error;

        setMessage("slideMessage", "Slide saved successfully.");

        slideForm.reset();

        byId("slideId").value = "";
        byId("slideActive").checked = true;
        byId("slideOrder").value = 0;

        await refreshDashboard();

    } catch (error) {
        console.error(error);

        setMessage(
            "slideMessage",
            error.message || "Unable to save slide."
        );
    }
});

/* ===================================
   EDIT CONTENT
   =================================== */

function editContent(id) {
    const item = contentCache.find(
        entry => String(entry.id) === String(id)
    );

    if (!item) return;

    byId("contentId").value = item.id;
    byId("title").value = item.title;
    byId("description").value = item.description || "";
    byId("category").value = item.category;
    byId("contentType").value = item.content_type;
    byId("imageURL").value = item.image_url || "";
    byId("mediaURL").value = item.media_url || "";
    byId("published").checked = item.published;

    window.scrollTo({
        top: contentForm.offsetTop,
        behavior: "smooth"
    });
}

/* ===================================
   DELETE CONTENT
   =================================== */

async function deleteContent(id) {
    if (!currentAdmin) return;

    if (!confirm("Delete this CKAVOX content?")) return;

    const { error } = await supabaseClient
        .from("ckavox_content")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Unable to delete content.");
        console.error(error);
        return;
    }

    await refreshDashboard();
}

/* ===================================
   EDIT SLIDE
   =================================== */

function editSlide(id) {
    const item = slideCache.find(
        entry => String(entry.id) === String(id)
    );

    if (!item) return;

    byId("slideId").value = item.id;
    byId("slideTitle").value = item.title;
    byId("slideSubtitle").value = item.subtitle || "";
    byId("slideImageURL").value = item.image_url;
    byId("slideLink").value = item.link_url || "";
    byId("slideOrder").value = item.sort_order;
    byId("slideActive").checked = item.active;

    window.scrollTo({
        top: slideForm.offsetTop,
        behavior: "smooth"
    });
}

/* ===================================
   DELETE SLIDE
   =================================== */

async function deleteSlide(id) {
    if (!currentAdmin) return;

    if (!confirm("Delete this slideshow item?")) return;

    const { error } = await supabaseClient
        .from("ckavox_slides")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Unable to delete slide.");
        console.error(error);
        return;
    }

    await refreshDashboard();
}

/* ===================================
   RENDER ADMIN LISTS
   =================================== */

function renderAdminContent() {
    const container = byId("adminContentList");

    if (!contentCache.length) {
        container.textContent = "No content added yet.";
        return;
    }

    container.innerHTML = contentCache.map(item => `
        <article class="app-card">

            <h3>${html(item.title)}</h3>

            <p>${html(item.category)}</p>

            <p>
                Status:
                ${item.published ? "Published" : "Draft"}
            </p>

            <button
                class="primary-button"
                data-edit-content="${html(item.id)}">
                Edit
            </button>

            <button
                data-delete-content="${html(item.id)}">
                Delete
            </button>

        </article>
    `).join("");
}

function renderAdminSlides() {
    const container = byId("adminSlideList");

    if (!slideCache.length) {
        container.textContent = "No slides added yet.";
        return;
    }

    container.innerHTML = slideCache.map(item => `
        <article class="app-card">

            <h3>${html(item.title)}</h3>

            <p>
                Status:
                ${item.active ? "Active" : "Hidden"}
            </p>

            <p>Order: ${html(item.sort_order)}</p>

            <button
                class="primary-button"
                data-edit-slide="${html(item.id)}">
                Edit
            </button>

            <button
                data-delete-slide="${html(item.id)}">
                Delete
            </button>

        </article>
    `).join("");
}

/* ===================================
   ACTION BUTTONS
   =================================== */

byId("adminContentList").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-content]");
    const deleteButton = event.target.closest("[data-delete-content]");

    if (editButton) {
        editContent(editButton.dataset.editContent);
    }

    if (deleteButton) {
        deleteContent(deleteButton.dataset.deleteContent);
    }
});

byId("adminSlideList").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-slide]");
    const deleteButton = event.target.closest("[data-delete-slide]");

    if (editButton) {
        editSlide(editButton.dataset.editSlide);
    }

    if (deleteButton) {
        deleteSlide(deleteButton.dataset.deleteSlide);
    }
});

/* ===================================
   CANCEL EDITING
   =================================== */

byId("cancelEdit").addEventListener("click", () => {
    contentForm.reset();
    byId("contentId").value = "";
});

byId("cancelSlideEdit").addEventListener("click", () => {
    slideForm.reset();
    byId("slideId").value = "";
    byId("slideActive").checked = true;
    byId("slideOrder").value = 0;
});

/* ===================================
   LOAD DASHBOARD DATA
   =================================== */

async function refreshDashboard() {
    if (!currentAdmin) return;

    const [contentResult, slideResult] = await Promise.all([
        supabaseClient
            .from("ckavox_content")
            .select("*")
            .order("created_at", { ascending: false }),

        supabaseClient
            .from("ckavox_slides")
            .select("*")
            .order("sort_order", { ascending: true })
    ]);

    if (contentResult.error || slideResult.error) {
        console.error(
            contentResult.error,
            slideResult.error
        );

        setMessage(
            "contentMessage",
            "Unable to load dashboard data. Check database permissions."
        );

        return;
    }

    contentCache = contentResult.data || [];
    slideCache = slideResult.data || [];

    renderAdminContent();
    renderAdminSlides();
}

/* ===================================
   START ADMIN
   =================================== */

async function startAdmin() {
    if (
        !window.supabase ||
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_ANON_KEY === "undefined" ||
        SUPABASE_URL.includes("PASTE_YOUR_") ||
        SUPABASE_ANON_KEY.includes("PASTE_YOUR_")
    ) {
        setMessage(
            "loginMessage",
            "Configure Supabase before using the admin dashboard."
        );

        return;
    }

    await checkAdmin();
}

startAdmin();
