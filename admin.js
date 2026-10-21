const statusBox = document.getElementById("adminStatus");
const messageBox = document.getElementById("adminMessage");
const postForm = document.getElementById("postForm");
const adminPosts = document.getElementById("adminPosts");

let authorizedAdmin = false;

function showAdminMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.style.color = isError ? "#ff7777" : "#ffc928";
}

function validHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch (_) {}

  return null;
}


// Verify the signed-in user AND their database role.

async function checkAdmin() {
  if (!supabaseClient) {
    statusBox.textContent = "Supabase configuration is missing.";
    return;
  }

  const { data: { user }, error } =
    await supabaseClient.auth.getUser();

  if (error || !user) {
    statusBox.textContent =
      "Access denied. Sign in through the main CKAVOX website first.";
    return;
  }

  const { data: profile, error: profileError } =
    await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    statusBox.textContent =
      "Access denied. Your account is not an administrator.";
    return;
  }

  authorizedAdmin = true;
  statusBox.textContent = `Administrator verified: ${user.email}`;

  postForm.hidden = false;

  await loadAdminPosts();
}


// Create a new story.

postForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!authorizedAdmin) {
    showAdminMessage("Administrator permission is required.", true);
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const summary = document.getElementById("summary").value.trim();
  const content = document.getElementById("content").value.trim();

  const imageInput = document.getElementById("imageUrl").value.trim();
  const externalInput = document.getElementById("externalUrl").value.trim();

  const imageUrl = validHttpUrl(imageInput);
  const externalUrl = validHttpUrl(externalInput);

  if (imageInput && !imageUrl) {
    showAdminMessage("Enter a valid HTTP or HTTPS image URL.", true);
    return;
  }

  if (externalInput && !externalUrl) {
    showAdminMessage("Enter a valid HTTP or HTTPS source URL.", true);
    return;
  }

  const published = document.getElementById("published").checked;

  const { data: { user } } =
    await supabaseClient.auth.getUser();

  const { error } = await supabaseClient
    .from("posts")
    .insert({
      title,
      category,
      summary,
      content: content || null,
      image_url: imageUrl,
      external_url: externalUrl,
      published,
      author_id: user.id
    });

  if (error) {
    showAdminMessage("Could not save story: " + error.message, true);
    return;
  }

  showAdminMessage(
    published
      ? "Story published successfully."
      : "Story saved as a draft."
  );

  postForm.reset();

  await loadAdminPosts();
});


// Display all stories to the authorized admin.

async function loadAdminPosts() {
  if (!authorizedAdmin) return;

  const { data, error } = await supabaseClient
    .from("posts")
    .select("id, title, category, published, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  adminPosts.replaceChildren();

  if (error) {
    showAdminMessage("Could not load stories.", true);
    return;
  }

  if (!data || data.length === 0) {
    adminPosts.textContent = "No stories have been added yet.";
    return;
  }

  data.forEach(post => {
    const card = document.createElement("article");
    card.className = "post-card";

    const body = document.createElement("div");
    body.className = "post-body";

    const heading = document.createElement("h3");
    heading.textContent = post.title;

    const category = document.createElement("p");
    category.textContent =
      `${post.category} · ${post.published ? "Published" : "Draft"}`;

    const toggle = document.createElement("button");
    toggle.className = "outline-button";
    toggle.textContent = post.published ? "Unpublish" : "Publish";

    toggle.addEventListener("click", async () => {
      if (!authorizedAdmin) return;

      const { error } = await supabaseClient
        .from("posts")
        .update({ published: !post.published })
        .eq("id", post.id);

      if (error) {
        showAdminMessage("Could not update story.", true);
        return;
      }

      showAdminMessage("Story status updated.");
      await loadAdminPosts();
    });

    const remove = document.createElement("button");
    remove.className = "outline-button";
    remove.style.marginLeft = "8px";
    remove.textContent = "Delete";

    remove.addEventListener("click", async () => {
      if (!authorizedAdmin) return;

      if (!confirm("Delete this story permanently?")) return;

      const { error } = await supabaseClient
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) {
        showAdminMessage("Could not delete story.", true);
        return;
      }

      showAdminMessage("Story deleted.");
      await loadAdminPosts();
    });

    body.append(heading, category, toggle, remove);
    card.appendChild(body);
    adminPosts.appendChild(card);
  });
}

checkAdmin();
