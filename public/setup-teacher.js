// setup-teacher.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- AUTH CHECK (Development ke liye commented hai) ---
    /*
    if (localStorage.getItem('kaizaro_teacher_setup_complete')) {
        window.location.href = 'dashboard-teacher.html';
    }
    */

    const form = document.getElementById('teacherSetupForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = document.querySelector('.btn-primary');
            const originalText = btn.innerHTML;
            
            // 1. Loading UI
            btn.innerHTML = `<span>Saving Profile...</span>`;
            btn.disabled = true;

            // 2. Gather Data
            const fname = document.getElementById('t_fname').value;
            const lname = document.getElementById('t_lname').value;
            const dept = document.getElementById('t_dept').value;
            const exp = document.getElementById('t_exp').value;
            
            // Collect checked subjects
            const subjects = [];
            document.querySelectorAll('.tag-checkbox:checked').forEach(cb => {
                subjects.push(cb.value);
            });

            if(subjects.length === 0) {
                alert("Please select at least one subject.");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // 3. Create Teacher Object
            const teacherProfile = {
                name: `${fname} ${lname}`,
                department: dept,
                experience: exp,
                subjects: subjects,
                role: 'TEACHER',
                joinedAt: new Date().toISOString()
            };

            // 4. Save to Local Storage (Simulating Database)
            localStorage.setItem('kaizaro_teacher_profile', JSON.stringify(teacherProfile));
            localStorage.setItem('kaizaro_selected_role', 'TEACHER');
            localStorage.setItem('kaizaro_teacher_setup_complete', 'true');

            // 5. Redirect to Dashboard
            setTimeout(() => {
                window.location.href = 'dashboard-teacher.html';
            }, 1000);
        });
    }
});