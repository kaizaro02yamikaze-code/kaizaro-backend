
document.addEventListener('DOMContentLoaded', async () => {
    // Check Session (Supabase)
    // We expect user to be logged in via Auth (email/pass) but not yet in public.users
    // Or maybe they are just Auth users. 

    const client = window.supabaseClient;
    const { data: { session } } = await client.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.querySelector('.btn-primary');
            const originalText = btn.innerText;
            btn.innerText = "Initializing System...";
            btn.disabled = true;

            try {
                // 1. Prepare Data
                const instituteName = document.getElementById('institute_name').value;
                const firstName = document.getElementById('owner_first').value;
                const lastName = document.getElementById('owner_last').value;
                const fullName = `${firstName} ${lastName}`;

                // 2. Create User Profile
                // Check if exists first? Or upsert.
                const { error: uErr } = await client.from('users').upsert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: fullName,
                    role: 'owner'
                });

                if (uErr) throw uErr;

                // 3. Create Institute
                const { error: iErr } = await client.from('institutes').insert({
                    owner_id: session.user.id,
                    name: instituteName
                });

                if (iErr) throw iErr;

                // Success
                window.utils.showToast("Setup Complete! Redirecting...", "success");

                setTimeout(() => {
                    window.location.href = 'dashboard-owner.html';
                }, 1500);

            } catch (err) {
                console.error(err);
                window.utils.showToast("Setup Failed: " + err.message, "error");
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});