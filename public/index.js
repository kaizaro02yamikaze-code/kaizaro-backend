document.addEventListener('DOMContentLoaded', () => {
    // 1. NAVIGATION LINKS HANDLING
    setupNavigation();

    // 2. LIVE DEMO BUTTON HANDLING
    setupDemoButton();
});

// --- NAVIGATION LOGIC ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Page refresh roko
            const text = e.target.innerText;
            
            // Logic: Alag alag link ke liye alag message
            let msg = `Exploring ${text}... feature coming soon!`;
            if(text === 'Pricing') msg = "Pro Plan: $99/mo (Demo Mode)";
            
            showToast(msg);
        });
    });
}

// --- DEMO PREVIEW LOGIC ---
function setupDemoButton() {
    // Button dhundo jo "View Live Demo" kehta hai
    const buttons = document.querySelectorAll('.btn-outline');
    let demoBtn = null;
    
    // Exact button filter karna
    buttons.forEach(btn => {
        if(btn.innerText.includes('View Live Demo')) demoBtn = btn;
    });

    if(demoBtn) {
        demoBtn.addEventListener('click', () => {
            loadDashboardPreview();
            showToast("Initializing Live Preview...");
        });
    }
}

function loadDashboardPreview() {
    const container = document.querySelector('.dashboard-preview');
    
    // HTML String jo fake dashboard banayega
    const dashboardHTML = `
        <div class="mock-dashboard">
            <div class="mock-sidebar">
                <div style="width:30px; height:30px; background:#2563EB; border-radius:6px;"></div>
                <div style="width:20px; height:20px; background:#333; border-radius:4px;"></div>
                <div style="width:20px; height:20px; background:#333; border-radius:4px;"></div>
                <div style="width:20px; height:20px; background:#333; border-radius:4px;"></div>
            </div>
            
            <div class="mock-content">
                <div style="display:flex; justify-content:space-between;">
                    <div class="mock-header"></div>
                    <div style="width:100px; height:30px; background:#2563EB; border-radius:4px;"></div>
                </div>

                <div class="mock-grid">
                    <div class="mock-card">
                        <div class="mock-label">Revenue</div>
                        <div class="mock-val" style="color:#10B981">$42.5k</div>
                    </div>
                    <div class="mock-card">
                        <div class="mock-label">Students</div>
                        <div class="mock-val">1,240</div>
                    </div>
                    <div class="mock-card">
                        <div class="mock-label">Pending Fees</div>
                        <div class="mock-val" style="color:#EF4444">$3.2k</div>
                    </div>
                </div>

                <div class="mock-card" style="flex:1; display:flex; align-items:end; justify-content:space-around; padding-bottom:0;">
                    <div style="width:10%; height:40%; background:#333; border-radius:4px 4px 0 0;"></div>
                    <div style="width:10%; height:60%; background:#333; border-radius:4px 4px 0 0;"></div>
                    <div style="width:10%; height:80%; background:#2563EB; border-radius:4px 4px 0 0;"></div>
                    <div style="width:10%; height:50%; background:#333; border-radius:4px 4px 0 0;"></div>
                    <div style="width:10%; height:70%; background:#333; border-radius:4px 4px 0 0;"></div>
                </div>
            </div>
        </div>
    `;

    // Inject HTML with Animation effect
    container.style.opacity = '0';
    setTimeout(() => {
        container.innerHTML = dashboardHTML;
        container.style.transition = 'opacity 0.5s ease';
        container.style.opacity = '1';
    }, 200);
}

// --- UTILITY: TOAST NOTIFICATION ---
function showToast(message) {
    // Check if toast exists, else create
    let toast = document.getElementById('web-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'web-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Google Login Handler (Already in your HTML, keeping it safe)
window.handleGoogleCallback = function(response) {
    console.log("Google Token:", response.credential);
    window.location.href = 'setup.html';
};