// CKAVOX Admin Dashboard

const message = document.getElementById("adminMessage");
const contentForm = document.getElementById("contentForm");
const contentList = document.getElementById("contentList");
const statistics = document.getElementById("statistics");

let currentUser = null;

function adminMessage(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#ff7070" : "#f5c400";
}

function safeText(value) {
    const element = document.createElement("span");
    element.textContent = value ?? "";
    return element.innerHTML;
}

async function checkAdmin() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.replace("login.html");
        return false;
    }

    currentUser = user;

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

    if (profileError || profile?.role !== "admin") {
        adminMessage(
            "Access denied. This account is not an administrator.",
            true
        );

        if (contentForm) contentForm.hidden = true;

        return false;
    }

    adminMessage("Signed in as Admin: " + user.email);
    return true;
}

async function uploadFile(file, folder) {
    if (!file) return null;

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabaseClient.storage
        .from("content-media")
        .upload(path, file, {
            upsert: false,
            contentType: file.type
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from("content-media")
        .getPublicUrl(path);

    return data.publicUrl;
}

// Add content
if (contentForm) {
    contentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) return;

        const allowed = await checkAdmin();
        if (!allowed) return;

        try {
            adminMessage("Saving content...");

            const imageFile =
                document.getElementById("imageFile").files[0];

            const mediaFile =
                document.getElementById("mediaFile").files[0];

            const imageUrl = await uploadFile(imageFile, "images");
            const mediaUrl = await uploadFile(mediaFile, "media");

            const record = {
                title: document.getElementById("contentTitle").value.trim(),
                type: document.getElementById("contentType").value,
                category: document.getElementById("contentCategory").value.trim(),
                description: document.getElementById("contentDescription").value.trim(),
                image_url: imageUrl,
                media_url: mediaUrl,
                external_url: document.getElementById("externalUrl").value.trim() || null,
                is_published: document.getElementById("publishContent").checked,
                created_by: currentUser.id
            };

            const { error } = await supabaseClient
                .from("content")
                .insert(record);

            if (error) throw error;

            adminMessage("Content saved successfully.");

            contentForm.reset();

            await loadContent();
        } catch (error) {
            adminMessage("Could not save content: " + error.message, true);
        }
    });
}

// Load existing content
async function loadContent() {
    const allowed = await checkAdmin();
    if (!allowed) return;

    const { data, error } = await supabaseClient
        .from("content")
        .select("id,title,type,category,is_published,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        contentList.textContent = "Error: " + error.message;
        return;
    }

    contentList.replaceChildren();

    if (!data.length) {
        contentList.textContent = "No content found.";
        return;
    }

    data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "admin-item";

        const title = document.createElement("h3");
        title.textContent = item.title;

        const details = document.createElement("p");
        details.textContent =
            `${item.type} / ${item.category} / ` +
            (item.is_published ? "Published" : "Draft");

        const toggle = document.createElement("button");
        toggle.textContent = item.is_published ? "UNPUBLISH" : "PUBLISH";

        toggle.addEventListener("click", async () => {
            const { error } = await supabaseClient
                .from("content")
                .update({ is_published: !item.is_published })
                .eq("id", item.id);

            if (error) {
                adminMessage(error.message, true);
                return;
            }

            await loadContent();
        });

        const remove = document.createElement("button");
        remove.textContent = "DELETE";

        remove.addEventListener("click", async () => {
            if (!confirm(`Delete "${item.title}"?`)) return;

            const { error } = await supabaseClient
                .from("content")
                .delete()
                .eq("id", item.id);

            if (error) {
                adminMessage(error.message, true);
                return;
            }

            await loadContent();
        });

        card.append(title, details, toggle, remove);
        contentList.appendChild(card);
    });
}

// Load statistics
async function loadStatistics() {
    const allowed = await checkAdmin();
    if (!allowed) return;

    const { count: contentCount, error: contentError } =
        await supabaseClient
            .from("content")
            .select("*", { count: "exact", head: true });

    const { count: viewsCount, error: viewsError } =
        await supabaseClient
            .from("content_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", "view");

    const { count: playsCount, error: playsError } =
        await supabaseClient
            .from("content_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", "play");

    if (contentError || viewsError || playsError) {
        statistics.textContent =
            "Could not load statistics. Check database policies.";
        return;
    }

    statistics.replaceChildren();

    [
        `Total content: ${contentCount ?? 0}`,
        `Recorded views: ${viewsCount ?? 0}`,
        `Recorded plays: ${playsCount ?? 0}`
    ].forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        statistics.appendChild(paragraph);
    });
}

document.getElementById("loadContent")
    ?.addEventListener("click", loadContent);

document.getElementById("refreshStats")
    ?.addEventListener("click", loadStatistics);

document.getElementById("logoutButton")
    ?.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    });

(async () => {
    const allowed = await checkAdmin();

    if (allowed) {
        await loadContent();
        await loadStatistics();
    }
})();
