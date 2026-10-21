 "use strict";

/*
  CKAVOX WEBSITE

  Before using authentication:
  1. Create a Supabase project.
  2. Enable Email authentication.
  3. Paste your project URL and publishable key below.
  4. Follow the SQL setup instructions provided after this file.
*/

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  SUPABASE_KEY &&
  !SUPABASE_KEY.includes("PASTE_")
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
}


/* --------------------------------
   LIVE CLOCK
--------------------------------- */

const clockElement = document.getElementById("clock");

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-GB", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const date = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  if (clockElement) {
    clockElement.textContent = `${date} | ${time}`;
  }

  document.getElementById("year").textContent =
    now.getFullYear();
}

updateClock();
setInterval(updateClock, 1000);


/* --------------------------------
   MOBILE NAVIGATION
--------------------------------- */

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", () => {
  navigation.classList.toggle("open");
});

navigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
  });
});


/* --------------------------------
   DEFAULT SLIDESHOW CONTENT

   Four slides per category.
   Slides change every four seconds.
--------------------------------- */

const fallbackContent = {
  films: [
    {
      title: "Discover Trending Movies",
      description: "Explore movies and discover where to watch them.",
      image:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.netflix.com/"
    },
    {
      title: "Cinema & Entertainment",
      description: "Discover stories from the world of cinema.",
      image:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.youtube.com/"
    },
    {
      title: "Movie Night",
      description: "Explore movie trailers and entertainment.",
      image:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.netflix.com/"
    },
    {
      title: "Your Next Favourite Film",
      description: "Search for films that interest you.",
      image:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.youtube.com/results?search_query=movie+trailers"
    }
  ],

  sports: [
    {
      title: "Football World",
      description: "Explore football news and highlights.",
      image:
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.fifa.com/"
    },
    {
      title: "Formula 1",
      description: "Discover motorsport and racing stories.",
      image:
        "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.formula1.com/"
    },
    {
      title: "Basketball",
      description: "Explore basketball news and highlights.",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.nba.com/"
    },
    {
      title: "Sports Action",
      description: "Discover sports from around the world.",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=85",
      link: "https://olympics.com/"
    }
  ],

  technology: [
    {
      title: "Technology Today",
      description: "Discover digital innovation and new technology.",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
      link: "https://techcrunch.com/"
    },
    {
      title: "Artificial Intelligence",
      description: "Explore AI and the future of technology.",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.technologyreview.com/"
    },
    {
      title: "Computers & Innovation",
      description: "Discover computers, hardware and digital tools.",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.theverge.com/"
    },
    {
      title: "The Digital Future",
      description: "Explore the latest technology developments.",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85",
      link: "https://techcrunch.com/"
    }
  ],

  showbiz: [
    {
      title: "African Entertainment",
      description: "Discover African music and entertainment.",
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.youtube.com/results?search_query=African+music"
    },
    {
      title: "Live Music",
      description: "Explore concerts, artists and live performances.",
      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85",
      link: "https://open.spotify.com/"
    },
    {
      title: "Music & Artists",
      description: "Discover trending artists and songs.",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.youtube.com/"
    },
    {
      title: "Entertainment News",
      description: "Explore entertainment from Africa and America.",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85",
      link: "https://www.billboard.com/"
    }
  ]
};


/* --------------------------------
   SAFE LINK VALIDATION
--------------------------------- */

function safeExternalUrl(value, fallback) {
  try {
    const url = new URL(value || fallback);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return fallback;
    }

    return url.href;
  } catch {
    return fallback;
  }
}


/* --------------------------------
   SLIDESHOW ENGINE
--------------------------------- */

function createSlider(sliderElement, items) {
  const slidesContainer = sliderElement.querySelector(".slides");
  const dotsContainer = sliderElement.querySelector(".slider-dots");
  const previousButton = sliderElement.querySelector(".previous");
  const nextButton = sliderElement.querySelector(".next");

  let currentIndex = 0;
  let timer = null;

  slidesContainer.replaceChildren();
  dotsContainer.replaceChildren();

  const validItems = items.slice(0, 4);

  validItems.forEach((item, index) => {
    const slide = document.createElement("article");
    slide.className = "slide";

    const img = document.createElement("img");

    img.src = item.image;
    img.alt = item.title;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";

    img.addEventListener("error", () => {
      img.alt = "Image unavailable";
      img.style.background = "#252525";
    });

    const caption = document.createElement("div");
    caption.className = "slide-caption";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const link = document.createElement("a");

    link.href = safeExternalUrl(item.link, "https://www.google.com/");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Explore More ↗";

    caption.append(title, description, link);
    slide.append(img, caption);
    slidesContainer.appendChild(slide);

    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Show slide ${index + 1}`);

    dot.addEventListener("click", () => {
      showSlide(index);
      restartTimer();
    });

    dotsContainer.appendChild(dot);
  });

  const slideElements = [...slidesContainer.children];
  const dotElements = [...dotsContainer.children];

  function showSlide(index) {
    currentIndex =
      (index + slideElements.length) % slideElements.length;

    slideElements.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
    });

    dotElements.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function previousSlide() {
    showSlide(currentIndex - 1);
  }

  function startTimer() {
    stopTimer();

    if (slideElements.length > 1) {
      timer = setInterval(nextSlide, 4000);
    }
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartTimer() {
    startTimer();
  }

  nextButton.addEventListener("click", () => {
    nextSlide();
    restartTimer();
  });

  previousButton.addEventListener("click", () => {
    previousSlide();
    restartTimer();
  });

  sliderElement.addEventListener("mouseenter", stopTimer);
  sliderElement.addEventListener("mouseleave", startTimer);

  showSlide(0);
  startTimer();

  return {
    update(items) {
      createSlider(sliderElement, items);
    }
  };
}


/* --------------------------------
   INITIALISE ALL FOUR SLIDESHOWS
--------------------------------- */

const sliders = {};

document.querySelectorAll(".slider").forEach(slider => {
  const category = slider.dataset.category;

  sliders[category] = createSlider(
    slider,
    fallbackContent[category] || []
  );
});


/* --------------------------------
   NEWS DISPLAY
--------------------------------- */

const newsGrid = document.getElementById("newsGrid");

function renderNews(items) {
  newsGrid.replaceChildren();

  if (!items || items.length === 0) {
    const message = document.createElement("p");
    message.className = "loading";
    message.textContent =
      "No news has been published yet. Check back soon.";

    newsGrid.appendChild(message);
    return;
  }

  items.forEach(item => {
    const article = document.createElement("article");
    article.className = "news-card";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";

    const content = document.createElement("div");
    content.className = "news-card-content";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const link = document.createElement("a");

    link.href = safeExternalUrl(
      item.link,
      "https://www.google.com/"
    );

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Read More ↗";

    content.append(title, description, link);
    article.append(img, content);
    newsGrid.appendChild(article);
  });
}


/* --------------------------------
   AUTHENTICATION
--------------------------------- */

const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const signUpButton = document.getElementById("signUpButton");
const signOutButton = document.getElementById("signOutButton");

const userDashboard = document.getElementById("userDashboard");
const userEmail = document.getElementById("userEmail");

const adminSection = document.getElementById("admin");

let currentUser = null;
let currentIsAdmin = false;

function showAuthMessage(message) {
  authMessage.textContent = message;
}

function validateSupabaseSetup() {
  if (!supabaseClient) {
    showAuthMessage(
      "Authentication setup is incomplete. Configure your Supabase URL and publishable key in script.js."
    );

    return false;
  }

  return true;
}

async function handleSignUp() {
  if (!validateSupabaseSetup()) return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (password.length < 8) {
    showAuthMessage("Use a password with at least 8 characters.");
    return;
  }

  signUpButton.disabled = true;
  showAuthMessage("Creating your account...");

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    if (data.session) {
      showAuthMessage("Account created successfully!");
    } else {
      showAuthMessage(
        "Account created. Check your email to confirm your account, then sign in."
      );
    }

  } catch (error) {
    showAuthMessage(error.message || "Unable to create account.");
  } finally {
    signUpButton.disabled = false;
  }
}

async function handleSignIn(event) {
  event.preventDefault();

  if (!validateSupabaseSetup()) return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  showAuthMessage("Signing in...");

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    showAuthMessage("Signed in successfully.");

    await refreshAccount();

    document.getElementById("account").scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {
    showAuthMessage(error.message || "Unable to sign in.");
  }
}

signUpButton.addEventListener("click", handleSignUp);
authForm.addEventListener("submit", handleSignIn);

signOutButton.addEventListener("click", async () => {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  currentUser = null;
  currentIsAdmin = false;

  await refreshAccount();
  showAuthMessage("You have signed out.");
});


/* --------------------------------
   ADMIN ROLE CHECK
--------------------------------- */

async function checkAdminRole(userId) {
  if (!supabaseClient || !userId) return false;

  const { data, error } = await supabaseClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Admin verification failed:", error.message);
    return false;
  }

  return Boolean(data);
}


/* --------------------------------
   ACCOUNT STATE
--------------------------------- */

async function refreshAccount() {
  if (!supabaseClient) {
    adminSection.hidden = true;
    return;
  }

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  currentUser = user || null;

  if (!currentUser) {
    currentIsAdmin = false;

    userDashboard.hidden = true;
    authForm.hidden = false;
    adminSection.hidden = true;

    document.getElementById("accountHeading").textContent =
      "Join the Community";

    document.getElementById("accountDescription").textContent =
      "Create an account or sign in to access your account.";

    return;
  }

  authForm.hidden = true;
  userDashboard.hidden = false;

  userEmail.textContent = currentUser.email || "";

  document.getElementById("accountHeading").textContent =
    "Welcome to CKAVOX";

  document.getElementById("accountDescription").textContent =
    "Your account is signed in.";

  currentIsAdmin = await checkAdminRole(currentUser.id);

  adminSection.hidden = !currentIsAdmin;

  if (currentIsAdmin) {
    await loadAdminContent();
  }

  await loadPublishedContent();
}


/* --------------------------------
   PUBLISHED CONTENT
--------------------------------- */

async function loadPublishedContent() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("content")
    .select("id,title,category,image_url,description,link_url,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load content:", error.message);
    return;
  }

  const items = (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description || "",
    image: row.image_url,
    link: row.link_url || "https://www.google.com/",
    category: row.category
  }));

  ["films", "sports", "technology", "showbiz"].forEach(category => {
    const categoryItems = items.filter(
      item => item.category === category
    );

    const combinedItems = [
      ...categoryItems,
      ...(fallbackContent[category] || [])
    ].slice(0, 4);

    if (sliders[category]) {
      sliders[category].update(combinedItems);
    }
  });

  const news = items.filter(item => item.category === "news");

  renderNews(news);
}


/* --------------------------------
   ADMIN: PUBLISH CONTENT
--------------------------------- */

const contentForm = document.getElementById("contentForm");

contentForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!supabaseClient || !currentUser || !currentIsAdmin) {
    alert("Only an authorized administrator can publish content.");
    return;
  }

  const title = document.getElementById("contentTitle").value.trim();
  const category = document.getElementById("contentCategory").value;
  const imageUrl = document.getElementById("contentImage").value.trim();
  const linkUrl = document.getElementById("contentLink").value.trim();
  const description = document.getElementById("contentDescription").value.trim();

  const safeImage = safeExternalUrl(imageUrl, "");

  if (!safeImage) {
    alert("Enter a valid image URL.");
    return;
  }

  if (linkUrl && !safeExternalUrl(linkUrl, "")) {
    alert("Enter a valid article or video URL.");
    return;
  }

  const submitButton = contentForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  try {
    const { error } = await supabaseClient
      .from("content")
      .insert({
        title,
        category,
        image_url: safeImage,
        link_url: linkUrl || null,
        description,
        published: true,
        created_by: currentUser.id
      });

    if (error) throw error;

    contentForm.reset();

    alert("Content published successfully!");

    await loadPublishedContent();
    await loadAdminContent();

  } catch (error) {
    alert(error.message || "Unable to publish content.");
  } finally {
    submitButton.disabled = false;
  }
});


/* --------------------------------
   ADMIN: LIST AND DELETE CONTENT
--------------------------------- */

async function loadAdminContent() {
  if (!supabaseClient || !currentIsAdmin) return;

  const list = document.getElementById("adminContentList");

  list.replaceChildren();

  const { data, error } = await supabaseClient
    .from("content")
    .select("id,title,category")
    .order("created_at", { ascending: false });

  if (error) {
    const message = document.createElement("p");
    message.textContent = "Unable to load admin content.";
    list.appendChild(message);
    return;
  }

  if (!data || data.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No content published yet.";
    list.appendChild(message);
    return;
  }

  data.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-item";

    const label = document.createElement("span");

    label.textContent = `${item.category.toUpperCase()} — ${item.title}`;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
      if (!currentIsAdmin) {
        alert("Administrator access required.");
        return;
      }

      const confirmed = confirm(
        `Are you sure you want to delete "${item.title}"?`
      );

      if (!confirmed) return;

      const { error: deleteError } = await supabaseClient
        .from("content")
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        alert(deleteError.message);
        return;
      }

      await loadPublishedContent();
      await loadAdminContent();
    });

    row.append(label, deleteButton);
    list.appendChild(row);
  });
}


/* --------------------------------
   AUTH STATE LISTENER
--------------------------------- */

async function initialiseAccount() {
  if (!supabaseClient) {
    renderNews([]);
    return;
  }

  await refreshAccount();

  supabaseClient.auth.onAuthStateChange(() => {
    setTimeout(() => {
      refreshAccount();
    }, 0);
  });
}

initialiseAccount();
