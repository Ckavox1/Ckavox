 "use strict";

/*
  CKAVOX WEBSITE

  Demo login only.
  Browser localStorage is not a secure authentication system.
  Content is stored in the current browser, not shared across visitors.
*/

const ADMIN_EMAIL = "admin@ckavox.com";
const ADMIN_PASSWORD = "adminckavox123";

const CONTENT_STORAGE_KEY = "ckavox_content_v1";
const SESSION_STORAGE_KEY = "ckavox_demo_admin_session";

const CATEGORIES = [
  "movies",
  "music",
  "books",
  "news",
  "showbiz"
];

let contents = [];
let currentSlide = 0;
let sliderTimer = null;


/* -----------------------------
   SAFE LOCAL STORAGE
----------------------------- */

function readStoredContent() {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item =>
      item &&
      typeof item.id === "string" &&
      CATEGORIES.includes(item.category) &&
      typeof item.title === "string"
    );

  } catch (error) {
    console.error("Could not load saved content:", error);
    return [];
  }
}


function saveContents() {
  try {
    localStorage.setItem(
      CONTENT_STORAGE_KEY,
      JSON.stringify(contents)
    );

    return true;

  } catch (error) {
    alert(
      "Could not save content. Your browser storage may be full or unavailable."
    );

    console.error("Could not save content:", error);
    return false;
  }
}


/* -----------------------------
   NAVIGATION
----------------------------- */

function showSection(sectionId) {
  const requestedSection = document.getElementById(sectionId);

  if (!requestedSection) {
    return;
  }

  if (
    sectionId === "admin-dashboard" &&
    !isAdminLoggedIn()
  ) {
    openLogin();
    return;
  }

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  requestedSection.classList.add("active");

  document.getElementById("navigation").classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (sectionId === "home") {
    renderFeaturedSlider();
  }
}


document.getElementById("menu-button").addEventListener("click", () => {
  document.getElementById("navigation").classList.toggle("open");
});


/* -----------------------------
   ADMIN LOGIN
----------------------------- */

function isAdminLoggedIn() {
  return sessionStorage.getItem(SESSION_STORAGE_KEY) === "yes";
}


function openLogin() {
  if (isAdminLoggedIn()) {
    showSection("admin-dashboard");
    renderAdminList();
    return;
  }

  const modal = document.getElementById("login-modal");

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("login-error").textContent = "";

  setTimeout(() => {
    document.getElementById("admin-email").focus();
  }, 100);
}


function closeLogin() {
  const modal = document.getElementById("login-modal");

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  document.getElementById("login-form").reset();
  document.getElementById("login-error").textContent = "";
}


document.getElementById("login-form").addEventListener("submit", event => {
  event.preventDefault();

  const email = document
    .getElementById("admin-email")
    .value
    .trim()
    .toLowerCase();

  const password = document
    .getElementById("admin-password")
    .value;

  if (
    email === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "yes");

    closeLogin();
    showSection("admin-dashboard");
    renderAdminList();

  } else {
    document.getElementById("login-error").textContent =
      "Incorrect email or password. Please try again.";
  }
});


function logout() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  showSection("home");

  alert("You have logged out.");
}


/* Close modal when clicking outside the box */

document.getElementById("login-modal").addEventListener("click", event => {
  if (event.target.id === "login-modal") {
    closeLogin();
  }
});


/* Close modal with Escape */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLogin();
  }
});


/* -----------------------------
   CONTENT VALIDATION
----------------------------- */

function safeExternalUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);

    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {
      return parsed.href;
    }

    return "";

  } catch {
    return "";
  }
}


function makeId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
}


/* -----------------------------
   ADD CONTENT
----------------------------- */

document.getElementById("content-form").addEventListener("submit", event => {
  event.preventDefault();

  if (!isAdminLoggedIn()) {
    alert("Please log in as admin first.");
    openLogin();
    return;
  }

  const category = document
    .getElementById("content-type")
    .value;

  const title = document
    .getElementById("content-title")
    .value
    .trim();

  const description = document
    .getElementById("content-desc")
    .value
    .trim();

  const image = safeExternalUrl(
    document.getElementById("content-img").value.trim()
  );

  const link = safeExternalUrl(
    document.getElementById("content-url").value.trim()
  );

  if (!CATEGORIES.includes(category)) {
    alert("Please choose a valid category.");
    return;
  }

  if (!title) {
    alert("Please enter a title.");
    return;
  }

  const newContent = {
    id: makeId(),
    category,
    title,
    description,
    image,
    link,
    createdAt: new Date().toISOString()
  };

  contents.unshift(newContent);

  if (!saveContents()) {
    contents.shift();
    return;
  }

  event.target.reset();

  renderAllContent();
  renderAdminList();

  currentSlide = 0;
  renderFeaturedSlider();

  alert("Content added successfully in this browser.");

  showSection("admin-dashboard");
});


/* -----------------------------
   IMAGE FALLBACK
----------------------------- */

function createFallbackImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
      <rect width="100%" height="100%" fill="#171717"/>
      <text x="50%" y="46%" fill="#f5c518"
        font-size="48" font-family="Arial"
        text-anchor="middle" font-weight="bold">CKAVOX</text>
      <text x="50%" y="60%" fill="#aaaaaa"
        font-size="18" font-family="Arial"
        text-anchor="middle">DISCOVER MORE</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}


function createImage(url, className, altText) {
  const img = document.createElement("img");

  img.className = className;
  img.alt = altText || "CKAVOX content";
  img.loading = "lazy";
  img.decoding = "async";

  img.src = safeExternalUrl(url) || createFallbackImage();

  img.addEventListener("error", () => {
    img.onerror = null;
    img.src = createFallbackImage();
  });

  return img;
}


/* -----------------------------
   SAFE CARD CREATION
----------------------------- */

function createContentCard(item) {
  const article = document.createElement("article");
  article.className = "content-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "card-image-wrap";

  imageWrap.appendChild(
    createImage(item.image, "card-image", item.title)
  );

  const body = document.createElement("div");
  body.className = "card-body";

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = item.category;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const description = document.createElement("p");
  description.textContent =
    item.description || "Discover more on CKAVOX.";

  body.append(category, title, description);

  if (item.link) {
    const link = document.createElement("a");

    link.className = "card-link";
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "EXPLORE MORE ↗";

    body.appendChild(link);
  }

  article.append(imageWrap, body);

  return article;
}


/* -----------------------------
   RENDER CATEGORY CONTENT
----------------------------- */

function renderCategory(category) {
  const container = document.getElementById(category + "-grid");

  if (!container) {
    return;
  }

  container.replaceChildren();

  const categoryItems = contents.filter(item =>
    item.category === category
  );

  if (categoryItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "no-content";

    const heading = document.createElement("h3");
    heading.textContent = "Coming Soon";

    const paragraph = document.createElement("p");
    paragraph.textContent =
      "New " + category + " content will appear here when published.";

    empty.append(heading, paragraph);
    container.appendChild(empty);

    return;
  }

  categoryItems.forEach(item => {
    container.appendChild(createContentCard(item));
  });
}


function renderAllContent() {
  CATEGORIES.forEach(category => {
    renderCategory(category);
  });
}


/* -----------------------------
   AUTOMATIC FEATURED SLIDER
   CHANGES EVERY 4 SECONDS
----------------------------- */

function getFeaturedItems() {
  return contents.slice(0, 10);
}


function renderFeaturedSlider() {
  const slider = document.getElementById("featured-slider");
  const items = getFeaturedItems();

  slider.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "✦";

    const title = document.createElement("h3");
    title.textContent = "Your next favorite starts here";

    const description = document.createElement("p");
    description.textContent =
      "Log in as admin to publish the first item.";

    empty.append(icon, title, description);
    slider.appendChild(empty);

    return;
  }

  if (currentSlide >= items.length) {
    currentSlide = 0;
  }

  if (currentSlide < 0) {
    currentSlide = items.length - 1;
  }

  const item = items[currentSlide];

  const slide = document.createElement("article");
  slide.className = "slide-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "slide-image-wrap";

  imageWrap.appendChild(
    createImage(item.image, "slide-image", item.title)
  );

  const body = document.createElement("div");
  body.className = "slide-content";

  const tag = document.createElement("span");
  tag.className = "slide-tag";
  tag.textContent = item.category;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const description = document.createElement("p");
  description.textContent =
    item.description || "Discover more on CKAVOX.";

  body.append(tag, title, description);

  if (item.link) {
    const link = document.createElement("a");

    link.className = "primary-button";
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "EXPLORE MORE ↗";

    body.appendChild(link);
  }

  slide.append(imageWrap, body);
  slider.appendChild(slide);
}


function moveSlide(direction) {
  const items = getFeaturedItems();

  if (items.length <= 1) {
    return;
  }

  currentSlide =
    (currentSlide + direction + items.length) % items.length;

  renderFeaturedSlider();

  restartSlider();
}


function startSlider() {
  stopSlider();

  sliderTimer = window.setInterval(() => {
    const items = getFeaturedItems();

    if (items.length > 1) {
      currentSlide = (currentSlide + 1) % items.length;
      renderFeaturedSlider();
    }
  }, 4000);
}


function stopSlider() {
  if (sliderTimer !== null) {
    window.clearInterval(sliderTimer);
    sliderTimer = null;
  }
}


function restartSlider() {
  startSlider();
}


/* Pause slider when browser tab is hidden */

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopSlider();
  } else {
    startSlider();
  }
});


/* -----------------------------
   ADMIN CONTENT LIST
----------------------------- */

function renderAdminList() {
  const list = document.getElementById("admin-content-list");
  const count = document.getElementById("content-count");

  list.replaceChildren();

  count.textContent =
    contents.length + (contents.length === 1 ? " item" : " items");

  if (contents.length === 0) {
    const empty = document.createElement("div");
    empty.className = "no-content";
    empty.textContent = "No content published yet.";
    list.appendChild(empty);
    return;
  }

  contents.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-item";

    const details = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const category = document.createElement("p");
    category.textContent =
      item.category.toUpperCase();

    details.append(title, category);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "DELETE";

    deleteButton.addEventListener("click", () => {
      deleteContent(item.id);
    });

    row.append(details, deleteButton);
    list.appendChild(row);
  });
}


function deleteContent(id) {
  if (!isAdminLoggedIn()) {
    alert("Please log in first.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this content?"
  );

  if (!confirmed) {
    return;
  }

  const oldContents = [...contents];

  contents = contents.filter(item => item.id !== id);

  if (!saveContents()) {
    contents = oldContents;
    return;
  }

  currentSlide = 0;

  renderAllContent();
  renderAdminList();
  renderFeaturedSlider();
}


/* -----------------------------
   INITIALIZE WEBSITE
----------------------------- */

function initializeWebsite() {
  contents = readStoredContent();

  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  renderAllContent();
  renderAdminList();
  renderFeaturedSlider();

  startSlider();
}


document.addEventListener("DOMContentLoaded", initializeWebsite);
