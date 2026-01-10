
document.addEventListener('DOMContentLoaded', async () => {

    const client = window.supabaseClient;
    const { data: { session } } = await client.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('studentSetupForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.querySelector('.btn-primary');
            const originalText = btn.innerText;
            btn.innerText = "Joining...";
            btn.disabled = true;

            try {
                const batchCode = document.getElementById('batch_code').value;
                const fullName = document.getElementById('full_name').value;

                // 1. Verify Batch Code
                const { data: batch, error: bErr } = await client
                    .from('batches')
                    .select('id, institute_id')
                    .eq('code', batchCode)
                    .single();

                if (bErr || !batch) {
                    throw new Error("Invalid Batch Code");
                }

                // 2. Upsert User
                const { error: uErr } = await client.from('users').upsert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: fullName,
                    role: 'student'
                });
                if (uErr) throw uErr;

                // 3. Create Student Profile
                const { error: sErr } = await client.from('student_profiles').insert({
                    user_id: session.user.id,
                    batch_id: batch.id
                });
                if (sErr) throw sErr;

                window.utils.showToast("Joined Successfully!", "success");
                setTimeout(() => window.location.href = 'dashboard-student.html', 1500);

            } catch (err) {
                console.error(err);
                window.utils.showToast(err.message, "error");
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});