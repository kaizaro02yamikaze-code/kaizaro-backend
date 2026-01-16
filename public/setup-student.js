document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons if using Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    /* // --- OPTIONAL: Prevent Re-entry ---
    // If the student has already completed setup, redirect them immediately.
    // Uncomment this block if you want to enforce one-time setup.
    
    if (localStorage.getItem('kaizaro_student_setup_complete')) {
        window.location.href = 'dashboard-student.html';
        return;
    } 
    */

    const form = document.getElementById('studentSetupForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the form from submitting normally

            // 1. Get Values
            const fullName = document.getElementById('full_name').value.trim();
            const rollNo = document.getElementById('roll_no').value.trim();
            const batchCode = document.getElementById('batch_code').value.trim();
            const gradeLevel = document.getElementById('grade_level').value;

            // 2. Basic Validation (Optional but recommended)
            if (!fullName || !batchCode || !gradeLevel) {
                alert("Please fill in all required fields.");
                return;
            }

            // 3. UI Feedback (Simulate Loading)
            const btn = document.querySelector('.btn-primary');
            const originalText = btn.innerText;
            btn.innerText = "Joining Class...";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            // 4. Save Student Data
            const studentData = {
                name: fullName,
                roll: rollNo,
                batch: batchCode,
                grade: gradeLevel,
                joinedAt: new Date().toISOString()
            };

            // Simulate server delay
            setTimeout(() => {
                localStorage.setItem('kaizaro_student_profile', JSON.stringify(studentData));
                localStorage.setItem('kaizaro_selected_role', 'STUDENT');
                localStorage.setItem('kaizaro_student_setup_complete', 'true');

                console.log("Student Profile Created:", studentData);

                // 5. Redirect to Student Dashboard
                window.location.href = 'dashboard-student.html';
            }, 1000); 
        });
    }
});