
// Utility Functions

// Show Toast Notification
function showToast(message, type = 'info') {
    let toast = document.getElementById('web-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'web-toast';
        toast.className = 'toast';
        // Basic toast styling if not in CSS
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = '#333';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : '#333');
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Check Session & Redirect
async function checkSession(allowedRoles = []) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
        // Redirect to login if not logged in
        if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return null;
    }

    // Check user profile for role
    const { data: userProfile, error } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !userProfile) {
        // If logged in but no profile, send to setup
        if (!window.location.href.includes('setup')) {
            window.location.href = 'setup.html';
        }
        return session;
    }

    // If role checking is required
    if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
        showToast('Unauthorized access', 'error');
        setTimeout(() => {
            // Redirect to their correct dashboard
            window.location.href = `dashboard-${userProfile.role.toLowerCase()}.html`;
        }, 1500);
        return null;
    }

    return { session, userProfile };
}

// Get URL Params
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Loading State Helper
function setLoading(buttonId, isLoading, text = 'Loading...') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    if (isLoading) {
        btn.dataset.originalText = btn.innerText;
        btn.innerText = text;
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        btn.innerText = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// Export
window.utils = {
    showToast,
    checkSession,
    getUrlParam,
    setLoading
};
