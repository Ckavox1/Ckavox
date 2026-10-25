 // Authentication Control workflows
const requestBtn = document.getElementById('request-token-btn');
const otpArea = document.getElementById('otp-verification-area');
const loginForm = document.getElementById('login-flow-form');

// 1. Dispatch secure OTP login token request to primary administrator account email
if (requestBtn) {
    requestBtn.addEventListener('click', async () => {
        const email = "cedrickkayiranga354@gmail.com";
        
        requestBtn.textContent = "Sending Token...";
        requestBtn.disabled = true;

        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false // Strictly lock registry mutations
            }
        });

        if (error) {
            alert("Error sending authentication code: " + error.message);
            requestBtn.textContent = "Send Authentication Code";
            requestBtn.disabled = false;
        } else {
            alert("Success! Check your email (cedrickkayiranga354@gmail.com) for your secure access token.");
            requestBtn.classList.add('hidden');
            otpArea.classList.remove('hidden');
        }
    });
}

// 2. Process token inputs to establish system user sessions
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = "cedrickkayiranga354@gmail.com";
        const token = document.getElementById('otp-token').value.trim();

        if(!token) return alert("Please supply verification token.");

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink'
        });

        if (error) {
            alert("Token verification failed: " + error.message);
        } else if (data.session) {
            window.location.href = "admin.html";
        }
    });
}

// 3. Password Recovery fallback handler functions
window.triggerPasswordRecovery = async function() {
    const email = "cedrickkayiranga354@gmail.com";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin.html',
    });
    
    if (error) {
        alert("Recovery process encounter: " + error.message);
    } else {
        alert("Recovery workflow fired! Verification link sent to " + email);
    }
};
