 
/* CKAVOX AUTHENTICATION */

const form = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("displayName");

const nameField = document.getElementById("nameField");
const signInButton = document.getElementById("signInButton");
const signUpButton = document.getElementById("signUpButton");
const signOutButton = document.getElementById("signOutButton");

const messageBox = document.getElementById("authMessage");
const userArea = document.getElementById("userArea");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const adminLink = document.getElementById("adminLink");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

let mode = "signin";

function showMessage(text, error = false) {
  messageBox.textContent = text;
  messageBox.style.color = error ? "#ff7777" : "#ffc928";
}

function getClient() {
  if (typeof supabaseClient === "undefined" || !supabaseClient) {
    showMessage(
      "Supabase is not configured. Check supabase-config.js.",
      true
    );
    return null;
  }
  return supabaseClient;
}

function setMode(nextMode) {
  mode = nextMode;
  const signingUp = mode === "signup";

  nameField.hidden = !signingUp;
  nameInput.required = signingUp;
  passwordInput.autocomplete =
    signingUp ? "new-password" : "current-password";

  signInButton.hidden = signingUp;
  signUpButton.textContent = signingUp ? "Create Account" : "Sign Up";

  formTitle.textContent =
    signingUp ? "Create Your Account" : "Welcome Back";

  formDescription.textContent = signingUp
    ? "Join the CKAVOX community."
    : "Sign in with your email and password.";

  showMessage("");
}

signUpButton.addEventListener("click", async () => {
  if (mode !== "signup") {
    setMode("signup");
    return;
  }

  const client = getClient();
  if (!client) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const displayName = nameInput.value.trim();

  if (!displayName || !email || password.length < 8) {
    showMessage(
      "Enter your name, a valid email, and a password of at least 8 characters.",
      true
    );
    return;
  }

  signUpButton.disabled = true;

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) throw error;

    if (data.session) {
      showMessage("Account created successfully.");
      await refreshAccount();
    } else {
      showMessage(
        "Account created. Check your email to confirm it, then sign in."
      );
      setMode("signin");
    }
  } catch (error) {
    showMessage(error.message || "Sign-up failed.", true);
  } finally {
    signUpButton.disabled = false;
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (mode === "signup") return;

  const client = getClient();
  if (!client) return;

  signInButton.disabled = true;

  try {
    const { error } = await client.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    if (error) throw error;

    showMessage("Signed in successfully.");
    await refreshAccount();
  } catch (error) {
    showMessage(error.message || "Sign-in failed.", true);
  } finally {
    signInButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  const client = getClient();
  if (!client) return;

  const { error } = await client.auth.signOut();

  if (error) {
    showMessage(error.message || "Sign-out failed.", true);
    return;
  }

  showMessage("You have signed out.");
  await refreshAccount();
});

async function refreshAccount() {
  const client = getClient();
  if (!client) return;

  const { data, error } = await client.auth.getUser();

  if (error) {
    showMessage("Could not verify your account.", true);
    return;
  }

  const user = data.user;

  if (!user) {
    userArea.hidden = true;
    form.hidden = false;
    adminLink.hidden = true;
    setMode("signin");
    return;
  }

  form.hidden = true;
  userArea.hidden = false;

  userName.textContent =
    "Name: " + (user.user_metadata?.display_name || "CKAVOX Member");

  userEmail.textContent = "Email: " + (user.email || "");

  // Check admin role in the protected database.
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  adminLink.hidden =
    !!profileError || profile?.role !== "admin";
}

async function initializeAuth() {
  const client = getClient();
  if (!client) return;

  await refreshAccount();

  client.auth.onAuthStateChange(() => {
    setTimeout(() => refreshAccount(), 0);
  });
}

initializeAuth();
