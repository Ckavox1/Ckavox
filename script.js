 // ==========================================
// CKAVOX WEBSITE
// ==========================================

// 1. LIVE CLOCK: KIGALI TIME

function updateClock() {
  const now = new Date();

  document.getElementById("clock").textContent =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kigali",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(now);

  document.getElementById("date").textContent =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kigali",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(now);

  document.getElementById("copyrightYear").textContent =
    new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Kigali",
      year: "numeric"
    }).format(now);
}

updateClock();
setInterval(updateClock, 1000);


// 2. HERO SLIDER: CHANGE EVERY 4 SECONDS

const slides = Array.from(
  document.querySelectorAll(".hero-slide")
);

const dotsContainer = document.getElementById("sliderDots");

let currentSlide = 0;
let sliderInterval;

slides.forEach((slide, index) => {
  const dot = document.createElement("button");

  dot.className = "slider-dot";
  dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

  dot.addEventListener("click", () => {
    showSlide(index);
    restartSlider();
  });

  dotsContainer.appendChild(dot);
});

const dots = Array.from(
  document.querySelectorAll(".slider-dot")
);

function showSlide(index) {
  if (!slides.length) return;

  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function restartSlider() {
  clearInterval(sliderInterval);
  sliderInterval = setInterval(nextSlide, 4000);
}

document.getElementById("nextSlide").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  restartSlider();
});

document.getElementById("previousSlide").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  restartSlider();
});

if (slides.length) {
  showSlide(0);
  restartSlider();
}


// 3. SUPABASE DATABASE AND AUTHENTICATION

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("authMessage");

const userArea = document.getElementById("userArea");
const userEmail = document.getElementById("userEmail");
const adminLink = document.getElementById("adminLink");

function message(text, error = false) {
  authMessage.textContent = text;
  authMessage.style.color = error ? "#ff7777" : "#ffc928";
}

function getClient() {
  if (!supabaseClient) {
    message(
      "Supabase is not configured. Check supabase-config.js.",
      true
    );
    return null;
  }

  return supabaseClient;
}


// SIGN UP

document.getElementById("signUpButton").addEventListener(
  "click",
  async () => {
    const client = getClient();
    if (!client) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || password.length < 8) {
      message("Enter a valid email and a password of at least 8 characters.", true);
      return;
    }

    const { data, error } = await client.auth.signUp({
      email,
      password
    });

    if (error) {
      message(error.message, true);
      return;
    }

    if (data.session) {
      message("Account created successfully.");
      await updateUser();
    } else {
      message(
        "Account created. Check your email to confirm your account before signing in."
      );
    }
  }
);


// SIGN IN

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const client = getClient();
  if (!client) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message(error.message, true);
    return;
  }

  message("Signed in successfully.");
  await updateUser();
});


// SIGN OUT

document.getElementById("signOutButton").addEventListener(
  "click",
  async () => {
    const client = getClient();
    if (!client) return;

    const { error } = await client.auth.signOut();

    if (error) {
      message(error.message, true);
      return;
    }

    message("You have signed out.");
    await updateUser();
  }
);


// CHECK USER AND ADMIN ROLE

async function updateUser() {
  if (!supabaseClient) return;

  const { data: { user }, error } =
    await supabaseClient.auth.getUser();

  if (error) {
    message("Could not check your account.", true);
    return;
  }

  if (!user) {
    userArea.hidden = true;
    adminLink.hidden = true;
    authForm.hidden = false;
    return;
  }

  userArea.hidden = false;
  authForm.hidden = true;
  userEmail.textContent = `Signed in as ${user.email}`;

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  adminLink.hidden = profile?.role !== "admin";

  await loadPosts();
}


// 4. LOAD PUBLISHED POSTS

const sections = {
  trending: "trendingPosts",
  news: "newsPosts",
  showbiz: "showbizPosts",
  sports: "sportsPosts",
  technology: "technologyPosts"
};

function safeLink(url) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
  } catch (_) {}

  return "";
}

function makePostCard(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  const image = document.createElement("img");
  image.className = "post-image";
  image.loading = "lazy";
  image.alt = post.title || "CKAVOX story";
  image.src = safeLink(post.image_url) ||
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85";

  image.onerror = () => {
    image.onerror = null;
    image.src =
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85";
  };

  const body = document.createElement("div");
  body.className = "post-body";

  const category = document.createElement("div");
  category.className = "post-category";
  category.textContent = post.category || "CKAVOX";

  const title = document.createElement("h3");
  title.textContent = post.title || "CKAVOX Story";

  const summary = document.createElement("p");
  summary.textContent = post.summary || "";

  body.append(category, title, summary);

  if (post.content) {
    const content = document.createElement("p");
    content.textContent = post.content;
    body.appendChild(content);
  }

  if (post.external_url) {
    const linkUrl = safeLink(post.external_url);

    if (linkUrl) {
      const link = document.createElement("a");
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Read More ↗";

      body.appendChild(link);
    }
  }

  article.append(image, body);

  return article;
}


async function loadPosts() {
  if (!supabaseClient) {
    Object.values(sections).forEach(id => {
      document.getElementById(id).replaceChildren();
      const info = document.createElement("p");
      info.className = "muted";
      info.textContent = "Connect Supabase to display published CKAVOX stories.";
      document.getElementById(id).appendChild(info);
    });
    return;
  }

  for (const [category, elementId] of Object.entries(sections)) {
    const container = document.getElementById(elementId);

    const { data, error } = await supabaseClient
      .from("posts")
      .select("id, title, summary, content, image_url, external_url, category, created_at")
      .eq("category", category)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      container.replaceChildren();

      const info = document.createElement("p");
      info.className = "muted";
      info.textContent = "Stories are temporarily unavailable.";

      container.appendChild(info);
      continue;
    }

    container.replaceChildren();

    if (!data || data.length === 0) {
      const info = document.createElement("p");
      info.className = "muted";
      info.textContent = "No stories published in this category yet.";
      container.appendChild(info);
      continue;
    }

    data.forEach(post => {
      container.appendChild(makePostCard(post));
    });
  }
}


// INITIALIZE

async function initializeCKAVOX() {
  if (!supabaseClient) {
    message(
      "Website ready. Configure Supabase to enable accounts and live posts."
    );
    await loadPosts();
    return;
  }

  await updateUser();

  supabaseClient.auth.onAuthStateChange(() => {
    setTimeout(() => updateUser(), 0);
  });
}

initializeCKAVOX();
