// CKAVOX Authentication

const loginForm = document.getElementById("loginForm");
const signupButton = document.getElementById("signupButton");
const forgotPassword = document.getElementById("forgotPassword");
const authMessage = document.getElementById("authMessage");

function showMessage(message, isError = false) {
    if (!authMessage) return;

    authMessage.textContent = message;
    authMessage.style.color = isError ? "#ff7070" : "#f5c400";
}

// Sign in
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        showMessage("Signing in...");

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage(error.message, true);
            return;
        }

        window.location.href = "index.html";
    });
}

// Create account
if (signupButton) {
    signupButton.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || password.length < 8) {
            showMessage(
                "Enter your email and a password with at least 8 characters.",
                true
            );
            return;
        }

        showMessage("Creating account...");

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + "/login.html"
            }
        });

        if (error) {
            showMessage(error.message, true);
            return;
        }

        showMessage(
            "Account request received. Check your email if confirmation is required."
        );
    });
}

// Password recovery by email
if (forgotPassword) {
    forgotPassword.addEventListener("click", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            showMessage(
                "Enter your email address first.",
                true
            );
            return;
        }

        const { error } = await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: window.location.origin + "/login.html"
            }
        );

        if (error) {
            showMessage(error.message, true);
            return;
        }

        showMessage("If the email is registered, password recovery instructions will be sent.");
    });
}
