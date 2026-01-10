
document.addEventListener('DOMContentLoaded', async () => {

    // Auth Check
    const client = window.supabaseClient;
    const { data: { session } } = await client.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Auto-fill or Hide Username/Password fields if they exist (since we are already logged in)
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    if (userField) {
        userField.value = session.user.email;
        userField.disabled = true;
        userField.parentElement.style.display = 'none'; // Hide if possible
    }
    if (passField) {
        passField.value = '********';
        passField.disabled = true;
        passField.parentElement.style.display = 'none';
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.querySelector('.btn-submit');
            const originalText = btn.innerText;
            btn.innerText = "Verifying...";
            btn.disabled = true;

            try {
                const code = document.getElementById('teacher-code').value;
                const instituteName = document.getElementById('institute').value;
                // We might not check institute name strictly if code is unique, but let's see.

                // 1. Verify Code
                const { data: invite, error: invErr } = await client
                    .from('invitation_codes')
                    .select('*')
                    .eq('code', code)
                    .eq('role', 'teacher')
                    .eq('is_used', false)
                    .single();

                if (invErr || !invite) {
                    throw new Error("Invalid or expired Teacher Code.");
                }

                // 2. Create User Profile
                // We typically upsert users table
                const { error: uErr } = await client.from('users').upsert({
                    id: session.user.id,
                    email: session.user.email,
                    // Get name from where? Setup didn't ask for name. 
                    // We'll use email part or Update later.
                    full_name: session.user.email.split('@')[0],
                    role: 'teacher'
                });
                if (uErr) throw uErr;

                // 3. Create Teacher Profile
                const { error: tErr } = await client.from('teacher_profiles').insert({
                    user_id: session.user.id,
                    institute_id: invite.institute_id
                });
                if (tErr) throw tErr;

                // 4. Mark Code Used? (Optional, if single use)
                // If codes are unique per invite, yes. If generic, no. 
                // DB Schema calculates uniqueness. Let's assume single use for security.
                // await client.from('invitation_codes').update({ is_used: true }).eq('id', invite.id);

                window.utils.showToast("Welcome, Professor!", "success");
                setTimeout(() => window.location.href = 'dashboard-teacher.html', 1500);

            } catch (err) {
                console.error(err);
                window.utils.showToast(err.message, "error");
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});