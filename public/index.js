/**
 * KAIZARO AUTH CONTROLLER (FIXED)
 */

// 1. Handle Email Login (Continue Button)
function handleEmailLogin(event) {
    // Page reload roko
    if(event && event.preventDefault) event.preventDefault(); 

    const emailInput = document.getElementById('emailInput');
    const email = emailInput && emailInput.value ? emailInput.value.trim() : "demo@institute.com";
    
    console.log("Logging in with:", email);

    // Validate email
    if (!email || email === '') {
        alert("Please enter a valid email");
        return;
    }

    // Dummy User Create Karo
    const user = {
        name: email.split('@')[0],
        email: email,
        id: "user_" + Math.floor(Math.random() * 1000),
        authType: 'email'
    };

    // Save Session
    localStorage.setItem('sb-user', JSON.stringify(user));
    
    // Clear any previous role/setup data to start fresh
    localStorage.removeItem('kaizaro_selected_role');

    // DIRECT REDIRECT TO SETUP.HTML
    window.location.href = 'setup.html';
}

// 2. Google Callback (Agar future mein Google ID daalo)
function handleGoogleCallback(response) {
    console.log("Google Token Recieved");
    
    const user = {
        name: "Google User",
        email: "google@demo.com",
        authType: 'google'
    };

    localStorage.setItem('sb-user', JSON.stringify(user));
    
    // Clear any previous role/setup data to start fresh
    localStorage.removeItem('kaizaro_selected_role');
    
    window.location.href = 'setup.html';
}

// 2b. Demo Login Handler
function handleDemoLogin() {
    console.log("Starting Demo Session...");
    
    const user = {
        name: "Demo Admin",
        email: "admin@kaizaro.demo",
        id: "demo_123",
        authType: 'demo'
    };

    localStorage.setItem('sb-user', JSON.stringify(user));
    localStorage.removeItem('kaizaro_selected_role');
    
    window.location.href = 'setup.html';
}

// 3. UI Helpers
function scrollToLogin() {
    document.getElementById('loginCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function togglePreview() {
    const preview = document.getElementById('livePreview');
    preview.style.display = preview.style.display === 'block' ? 'none' : 'block';
}