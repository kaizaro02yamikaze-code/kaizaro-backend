document.addEventListener('DOMContentLoaded', () => {
    
    // --- DEVELOPMENT MODE FIX ---
    // Comment out this block if you want to skip the "Already Initialized" check during testing.
    /*
    if (localStorage.getItem('kaizaro_owner_setup_complete')) {
        alert("⚠️ Security Alert: System is already initialized. Redirecting to Dashboard.");
        window.location.href = 'dashboard-owner.html';
        return;
    }
    */
    // -----------------------------

    const form = document.querySelector('form'); // Select the form

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop standard form submission

            // 1. Gather Data from the Form
            const ownerData = {
                instituteName: document.getElementById('institute_name').value,
                regId: document.getElementById('reg_id').value,
                domain: document.getElementById('domain').value,
                ownerName: document.getElementById('owner_first').value + " " + document.getElementById('owner_last').value,
                email: document.getElementById('owner_email').value,
                permissions: {
                    create: document.getElementById('perm_create').checked,
                    delete: document.getElementById('perm_delete').checked,
                    finance: document.getElementById('perm_finance').checked,
                    export: document.getElementById('perm_export').checked
                },
                policy: {
                    joinType: document.querySelector('input[name="join_policy"]:checked').value,
                    maxAttempts: document.getElementById('max_attempts').value,
                    tabSwitch: document.getElementById('tab_switch').value
                },
                initializedAt: new Date().toISOString()
            };

            // 2. Validate Critical Checkbox
            if (!document.getElementById('confirm_lock').checked) {
                alert("Please confirm the system lock agreement.");
                return;
            }

            // 3. Save Data to Simulate Backend (LocalStorage)
            localStorage.setItem('kaizaro_owner_config', JSON.stringify(ownerData));
            
            // Save role
            localStorage.setItem('kaizaro_selected_role', 'OWNER');
            
            // Set the "Setup Complete" flag so user doesn't see this page again (in production)
            localStorage.setItem('kaizaro_owner_setup_complete', 'true');

            // 4. UI Feedback
            const btn = document.querySelector('.btn-primary');
            btn.innerText = "Initializing Core Systems...";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            // 5. REDIRECT to Owner Dashboard after a short delay
            setTimeout(() => {
                console.log("System Initialized. Redirecting...");
                window.location.href = 'dashboard-owner.html';
            }, 1500);
        });
    }
});