 /*
CKAVOX WEBSITE

Shyiramo Supabase Project URL na public anon/publishable key.
Ntukoreshe service_role key muri JavaScript.
*/

const SUPABASE_URL =
"PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";

const SUPABASE_ANON_KEY =
"PASTE_YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";


const categories = [
  {id:"news", title:"Latest News", kicker:"STAY INFORMED"},
  {id:"showbiz", title:"Showbiz", kicker:"MUSIC & ENTERTAINMENT"},
  {id:"sports", title:"Sports & Formula 1", kicker:"SPORTS WORLD"},
  {id:"films", title:"Films", kicker:"MOVIES & SERIES"},
  {id:"technology", title:"Technology", kicker:"INNOVATION"},
  {id:"trending", title:"Trending", kicker:"WHAT'S TRENDING"}
];


// AMAFOTO Y'ICYITEGEREREZO
// Amafoto akurwa kuri Unsplash kandi akenera internet.

const photos = {
  news: [
    "photo-1495020689067-958852a7765e",
    "photo-1504711434969-e33886168f5c",
    "photo-1529107386315-e1a2ed48a620",
    "photo-1523240795612-9a054b0db644"
  ],

  showbiz: [
    "photo-1516280440614-37939bbacd81",
    "photo-1501386761578-eac5c94b800a",
    "photo-1492684223066-81342ee5ff30",
    "photo-1514525253161-7a46d19cd819"
  ],

  sports: [
    "photo-1522778119026-d647f0596c20",
    "photo-1503736334956-4c8f8e92946d",
    "photo-1461896836934-ffe607ba8211",
    "photo-1517466787929-bc90951d0974"
  ],

  films: [
    "photo-1489599849927-2ee91cede3ba",
    "photo-1522869635100-9f4c5e86aa37",
    "photo-1485846234645-a62644f84728",
    "photo-1440404653325-ab127d49abc1"
  ],

  technology: [
    "photo-1518770660439-4636190af475",
    "photo-1677442136019-21780ecad995",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1519389950473-47ba0277781c"
  ],

  trending: [
    "photo-1492684223066-81342ee5ff30",
    "photo-1535223289827-42f1e9919769",
    "photo-1529139574466-a303027c1d8b",
    "photo-1516321318423-f06f85e504b3"
  ]
};


const demoTitles = {
  news: [
    "World News",
    "Rwanda News",
    "Business News",
    "Education Updates"
  ],

  showbiz: [
    "Music and Artists",
    "Celebrity Interviews",
    "Entertainment Events",
    "Behind the Scenes"
  ],

  sports: [
    "Football Highlights",
    "Formula 1",
    "Athlete Stories",
    "Match Day"
  ],

  films: [
    "New Film Releases",
    "Series to Watch",
    "Film Making",
    "Cinema Culture"
  ],

  technology: [
    "Technology News",
    "AI and Innovation",
    "Phones and Gadgets",
    "Digital Life"
  ],

  trending: [
    "Trending Conversations",
    "Viral Moments",
    "What's Popular",
    "Fresh Discoveries"
  ]
};


// ISAAHA N'ITARIKI

function updateClock() {
  const now = new Date();

  document.getElementById("clockTime").textContent =
    now.toLocaleTimeString("en-GB", {
      hour12: false
    });

  document.getElementById("clockDate").textContent =
    now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  document.getElementById("year").textContent =
    now.getFullYear();
}

updateClock();

setInterval(updateClock, 1000);


// MENU YA TELEFONI

document.getElementById("menuToggle")
.addEventListener("click", () => {
  document.getElementById("mainNav")
  .classList.toggle("open");
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("mainNav")
    .classList.remove("open");
  });
});


// HERO SLIDESHOW

const heroSlides = [
  {
    title: "Stories that keep you informed.",
    description: "News, entertainment, technology and sports.",
    image: "photo-1495020689067-958852a7765e"
  },

  {
    title: "The World of Entertainment.",
    description: "Music, films and showbiz stories.",
    image: "photo-1501386761578-eac5c94b800a"
  },

  {
    title: "Stay Close to the Action.",
    description: "Sports, Formula 1 and unforgettable moments.",
    image: "photo-1503736334956-4c8f8e92946d"
  },

  {
    title: "Discover What's Next.",
    description: "Technology, innovation and trending stories.",
    image: "photo-1518770660439-4636190af475"
  }
];

let heroIndex = 0;
let heroTimer;


function imageURL(photo) {
  return "https://images.unsplash.com/" +
    photo +
    "?auto=format&fit=crop&w=1600&q=90";
}


function renderHero() {
  const slide = heroSlides[heroIndex];

  document.getElementById("heroImage")
    .style.backgroundImage =
    `url("${imageURL(slide.image)}")`;

  document.getElementById("heroTitle")
    .textContent = slide.title;

  document.getElementById("heroDescription")
    .textContent = slide.description;

  document.getElementById("heroDots").innerHTML =
    heroSlides.map((slide, index) => `
      <button
        class="dot ${index === heroIndex ? "active" : ""}"
        data-index="${index}"
        aria-label="Go to slide ${index + 1}">
      </button>
    `).join("");

  document.querySelectorAll("#heroDots .dot")
    .forEach(button => {
      button.addEventListener("click", () => {
        heroIndex = Number(button.dataset.index);
        renderHero();
        restartHero();
      });
    });
}


function restartHero() {
  clearInterval(heroTimer);

  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    renderHero();
  }, 4000);
}


document.getElementById("heroPrev")
.addEventListener("click", () => {
  heroIndex =
    (heroIndex - 1 + heroSlides.length) %
    heroSlides.length;

  renderHero();
  restartHero();
});


document.getElementById("heroNext")
.addEventListener("click", () => {
  heroIndex =
    (heroIndex + 1) % heroSlides.length;

  renderHero();
  restartHero();
});


renderHero();
restartHero();


// CONTENT CARDS

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}


function renderSections(storiesByCategory) {
  const root = document.getElementById("contentSections");

  root.innerHTML = categories.map(category => {
    const stories = storiesByCategory[category.id] || [];

    const cards = stories.map(story => `
      <article class="story-card">

        <img
          loading="lazy"
          src="${escapeHTML(story.image_url)}"
          alt="${escapeHTML(story.title)}">

        <div class="story-body">

          <span class="story-tag">
            ${escapeHTML(category.title)}
          </span>

          <h3>${escapeHTML(story.title)}</h3>

          <p>
            ${escapeHTML(story.summary || "")}
          </p>

          ${
            story.external_url
            ? `<a class="read-more"
                href="${escapeHTML(story.external_url)}"
                target="_blank"
                rel="noopener">Read more ↗</a>`
            : ""
          }

        </div>

      </article>
    `).join("");

    return `
      <section class="content-section" id="${category.id}">

        <div class="section-heading">

          <div>
            <p class="eyebrow">${category.kicker}</p>
            <h2>${category.title}</h2>
          </div>

          <div class="section-controls">

            <button
              data-scroll="${category.id}"
              data-dir="-1"
              aria-label="Previous story">‹</button>

            <button
              data-scroll="${category.id}"
              data-dir="1"
              aria-label="Next story">›</button>

          </div>

        </div>

        <div class="story-track" id="track-${category.id}">
          ${cards}
        </div>

      </section>
    `;
  }).join("");


  // NEXT / PREVIOUS BUTTONS

  root.querySelectorAll("[data-scroll]")
    .forEach(button => {
      button.addEventListener("click", () => {

        const track = document.getElementById(
          "track-" + button.dataset.scroll
        );

        track.scrollBy({
          left:
            Number(button.dataset.dir) *
            Math.max(260, track.clientWidth * 0.8),

          behavior: "smooth"
        });
      });
    });


  // AUTOMATIC SLIDESHOW FOR EVERY CATEGORY

  categories.forEach(category => {
    const track = document.getElementById(
      "track-" + category.id
    );

    if (!track || track.dataset.started) return;

    track.dataset.started = "yes";

    let pausedUntil = 0;

    ["mouseenter", "touchstart", "pointerdown"]
      .forEach(eventName => {
        track.addEventListener(eventName, () => {
          pausedUntil = Date.now() + 8000;
        }, { passive: true });
      });

    setInterval(() => {

      if (Date.now() < pausedUntil) return;

      if (track.scrollWidth <= track.clientWidth + 5) {
        return;
      }

      if (
        track.scrollLeft + track.clientWidth >=
        track.scrollWidth - 10
      ) {
        track.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      } else {
        track.scrollBy({
          left: Math.max(260, track.clientWidth * 0.8),
          behavior: "smooth"
        });
      }

    }, 4000);

  });
}


// SAMPLE CONTENT

function createDemoContent() {
  const content = {};

  categories.forEach(category => {

    content[category.id] = photos[category.id].map(
      (photo, index) => ({
        title: demoTitles[category.id][index],

        summary:
          "Discover the latest stories and updates on CKAVOX.",

        image_url: imageURL(photo),

        external_url: ""
      })
    );

  });

  return content;
}


renderSections(createDemoContent());


// SUPABASE ACCOUNT SYSTEM

let supabaseClient = null;

const configured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");


if (configured && window.supabase) {

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  loadPublishedContent();
  restoreSession();

} else {

  document.getElementById("authStatus").textContent =
    "Supabase setup is required to activate accounts.";

}


async function loadPublishedContent() {

  try {

    const { data, error } = await supabaseClient
      .from("stories")
      .select(
        "id,category,title,summary,image_url,external_url,created_at"
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data && data.length) {

      const grouped = {};

      categories.forEach(category => {
        grouped[category.id] = [];
      });

      data.forEach(story => {
        if (grouped[story.category]) {
          grouped[story.category].push(story);
        }
      });

      renderSections(grouped);
    }

  } catch (error) {
    console.error("Content loading error:", error.message);
  }

}


async function restoreSession() {

  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (session) {
    showSignedIn(session.user);
  }

  supabaseClient.auth.onAuthStateChange(
    (_event, session) => {

      if (session) {
        showSignedIn(session.user);
      } else {
        showSignedOut();
      }

    }
  );

}


function showSignedIn(user) {

  document.getElementById("authForm").hidden = true;

  document.getElementById("signedInPanel").hidden = false;

  document.getElementById("signedInEmail").textContent =
    "Signed in as " + user.email;

  document.getElementById("accountHeading").textContent =
    "My CKAVOX Account";

  document.getElementById("accountMessage").textContent =
    "Welcome to your CKAVOX account.";

  checkAdmin(user);
}


function showSignedOut() {

  document.getElementById("authForm").hidden = false;

  document.getElementById("signedInPanel").hidden = true;

  document.getElementById("adminLink").hidden = true;

  document.getElementById("accountHeading").textContent =
    "Join the Community";

  document.getElementById("accountMessage").textContent =
    "Create an account or sign in to access your account.";

}


async function checkAdmin(user) {

  try {

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    document.getElementById("adminLink").hidden =
      !!error || !data?.is_admin;

  } catch {
    document.getElementById("adminLink").hidden = true;
  }

}


function setAuthStatus(message) {
  document.getElementById("authStatus").textContent = message;
}


// SIGN IN

document.getElementById("authForm")
.addEventListener("submit", async event => {

  event.preventDefault();

  if (!supabaseClient) {
    setAuthStatus("Please configure Supabase first.");
    return;
  }

  setAuthStatus("Signing in...");

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    setAuthStatus(error.message);
  } else {
    showSignedIn(data.user);
    setAuthStatus("Signed in successfully.");
  }

});


// SIGN UP

document.getElementById("signUpBtn")
.addEventListener("click", async () => {

  if (!supabaseClient) {
    setAuthStatus("Please configure Supabase first.");
    return;
  }

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  if (!email || password.length < 6) {
    setAuthStatus(
      "Enter your email and a password of at least 6 characters."
    );
    return;
  }

  setAuthStatus("Creating your account...");

  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  if (error) {
    setAuthStatus(error.message);
  } else if (data.session) {
    showSignedIn(data.user);
    setAuthStatus("Account created successfully.");
  } else {
    setAuthStatus(
      "Account created. Check your email if confirmation is required."
    );
  }

});


// SIGN OUT

document.getElementById("signOutBtn")
.addEventListener("click", async () => {

  if (!supabaseClient) return;

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    setAuthStatus(error.message);
  } else {
    showSignedOut();
    setAuthStatus("You have signed out.");
  }

});
