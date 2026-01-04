document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    // Only attach the event listener if the form exists on the page
    if (loginForm) {
        loginForm.addEventListener('submit', handleTeacherLogin);
    }
});

function handleTeacherLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const submitBtn = document.querySelector('.btn-submit');
    
    // Safety check in case the button class is different
    if (submitBtn) {
        const originalBtnText = submitBtn.innerText;
        
        // 1. UI Feedback: Show loading state
        submitBtn.innerText = "Verifying Credentials...";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;
    }

    // 2. Get Values from the Input Fields
    const institute = document.getElementById('institute').value.trim();
    const teacherCode = document.getElementById('teacher-code').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // 3. Validation: Ensure all fields are filled
    if (!institute || !teacherCode || !username || !password) {
        alert("ACCESS DENIED: Please fill in all required fields.");
        resetButton(submitBtn);
        return;
    }

    // 4. Simulate Server Authentication (Delay)
    setTimeout(() => {
        // --- AUTHENTICATION LOGIC START ---
        // In a real application, you would send a request to your backend API here.
        // For this demo, we assume any non-empty input is valid.
        
        console.log("Teacher Authentication Successful");

        // 5. Session Management
        // Store teacher details in sessionStorage so the dashboard can display them
        sessionStorage.setItem('kaizaro_teacher_session', JSON.stringify({
            institute: institute,
            teacherCode: teacherCode,
            name: username,
            role: 'TEACHER',
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        }));

        // 6. REDIRECT to Teacher Dashboard
        window.location.href = 'dashboard-teacher.html';
        
        // --- AUTHENTICATION LOGIC END ---

    }, 1500); // 1.5-second simulated delay
}

// Helper function to reset the button state if validation fails
function resetButton(btn) {
    if (btn) {
        btn.innerText = "Access Dashboard"; // Or whatever the original text was
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}