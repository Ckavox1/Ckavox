 
/* CKAVOX ACCOUNT SYSTEM */

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const displayNameInput = document.getElementById("displayName");
const authMessage = document.getElementById("authMessage");

const userArea = document.getElementById("userArea");
const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const accountCreated = document.getElementById("accountCreated");
const accountHeading = document.getElementById("accountHeading");
const accountDescription = document.getElementById("accountDescription");
const signInButton = document.getElementById("signInButton");
const signUpButton = document.getElementById("signUpButton");
const signOutButton = document.getElementById("signOutButton");
const adminLink = document.getElementById("adminLink");

function message(text, error = false) {
  authMessage.textContent = text;
  authMessage.style.color = error ? "#ff7777" : "#ffc928";
}

function getClient() {
  if (!supabaseClient) {
    message("Supabase configuration is missing.", true);
    return null;
  }
  return supabaseClient;
}

// Switch between registration and login forms.
signUpButton.addEventListener("click", async () => {
  const client = getClient();
  if (!client) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const displayName = displayNameInput.value.trim();

  if (!displayName) {
    message("Please enter your full name.", true);
    displayNameInput.focus();
    return;
  }

  if (!email || password.length < 8) {
    message("Enter a valid email and a password of at least 8 characters.", true);
    return;
  }

  signUpButton.disabled = true;
  signUpButton.textContent = "Creating account...";

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
      message("Account created successfully.");
      await updateUser();
    } else {
      message("Account created. Check your email to confirm it, then sign in.");
    }
  } catch (error) {
    message(error.message || "Could not create account.", true);
  } finally {
    signUpButton.disabled = false;
    signUpButton.textContent = "Sign Up";
  }
});

// Sign in to an existing account.
authForm.addEventListener("submit", async event => {
  event.preventDefault();

  const client = getClient();
  if (!client) return;

  const { error } = await client.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value
  });

  if (error) {
    message(error.message, true);
    return;
  }

  message("Signed in successfully.");
  await updateUser();
});

// Sign out.
signOutButton.addEventListener("click", async () => {
  const client = getClient();
  if (!client) return;

  const { error } = await client.auth.signOut();

  if (error) {
    message(error.message, true);
    return;
  }

  message("You have signed out.");
  await updateUser();
});

// Load the signed-in user's own account information.
async function updateUser() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    message("Could not check your account.", true);
    return;
  }

  const user = data.user;

  if (!user) {
    userArea.hidden = true;
    authForm.hidden = false;
    displayNameInput.hidden = false;
    signInButton.hidden = false;
    adminLink.hidden = true;

    accountHeading.textContent = "Join the Community";
    accountDescription.textContent =
      "Create an account or sign in to access your account.";
    return;
  }

  authForm.hidden = true;
  userArea.hidden = false;

  accountHeading.textContent = "Welcome to CKAVOX";
  accountDescription.textContent = "Your personal account.";

  userName.textContent =
    "Name: " + (user.user_metadata?.display_name || "CKAVOX Member");

  userEmail.textContent = "Email: " + user.email;

  accountCreated.textContent =
    "Account created: " +
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeZone: "Africa/Kigali"
    }).format(new Date(user.created_at));

  // Admin permission is determined by the database role.
  const { data: profile, error: profileError } =
    await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  adminLink.hidden =
    !!profileError || profile?.role !== "admin";
}

// Initialize account state and keep it synchronized.
async function initializeAccount() {
  await updateUser();

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(() => {
      setTimeout(() => updateUser(), 0);
    });
  }
}

initializeAccount();
