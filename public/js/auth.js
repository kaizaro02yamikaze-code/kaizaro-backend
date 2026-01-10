
// Auth Logic using Supabase

const Auth = {
    // Sign In with Email
    signIn: async (email, password) => {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign Up with Email
    signUp: async (email, password) => {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password
        });
        return { data, error };
    },

    // Sign Out
    signOut: async () => {
        const { error } = await window.supabaseClient.auth.signOut();
        if (!error) {
            window.location.href = 'index.html';
        } else {
            console.error('Logout error:', error);
        }
    },

    // Initialize Auth Listeners (Call this on page load)
    init: () => {
        // Handle Login Form
        const loginForm = document.getElementById('emailForm');
        if (loginForm) {
            // Remove previous inline handler hack if possible, or just overwrite onsubmit
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                await Auth.handleAuthForm(e);
            };
        }

        // Handle Logout Buttons
        const logoutBtns = document.querySelectorAll('.logout-btn'); // Add this class to logout buttons
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.signOut();
            });
        });
    },

    // Form Handler
    handleAuthForm: async (e) => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button[type="submit"]');

        // Simple toggle for Sign In / Sign Up (Logic only, assuming UI has a toggle or we try both)
        // For this MVP, let's try Sign In. If "Invalid login credentials", maybe we can prompt?
        // Or we can just assume the user is trying to Sign In. 
        // For new users (Owner), they probably need a "Sign Up" button. 
        // Let's assume standard behavior: Try Sign In. 

        // Helper to show loading
        const originalText = btn.innerHTML;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        try {
            // Try Sign In
            let { data, error } = await Auth.signIn(email, password);

            if (error) {
                // If invalid login, maybe they are new? 
                // In a perfect world, we have a separate Sign Up form.
                // We'll prompt the user or show error.
                if (error.message.includes("Invalid login credentials")) {
                    // Start Free Trial usually implies Signup.
                    // If we are on "index.html" and they clicked "Start Free Trial", maybe we should SignUp?
                    // Let's fallback to SignUp if specific error is "User not found" (Supabase gives generic message though).
                    // We'll just show the error for now as per "Prototyping" rules, but allow a "SignUp" override via code if needed.

                    // AUTO SIGNUP for MVP if "Start Free Trial" flow? 
                    // Let's just try SignUp if SignIn fails and it looks like a new user? No, unsafe.

                    // Show error
                    window.utils.showToast(error.message, 'error');
                } else {
                    window.utils.showToast(error.message, 'error');
                }
            } else {
                // Success
                window.utils.showToast('Login Successful!', 'success');
                // Check Profile and Redirect
                const { userProfile } = await window.utils.checkSession();
                // checkSession handles redirection logic internaly if profile exists/missing
            }
        } catch (err) {
            console.error(err);
            window.utils.showToast('An unexpected error occurred.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

// Expose Auth
window.Auth = Auth;

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
