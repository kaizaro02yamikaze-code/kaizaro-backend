/**
 * STUDENT EXAM ACCESS GATEWAY (TEST MODE)
 * ---------------------------------------
 * Relaxed validation for easy testing.
 * Accepts ANY batch code > 1 char.
 * Auto-redirects to dashboard-student.html
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    ExamGate.init();
});

// --- 1. MOCK DATABASE (SIMPLIFIED) ---
const MockDB = {
    // We will dynamically accept any code for testing
    activeSessions: new Set()
};

// --- 2. CORE LOGIC ---
const ExamGate = {
    elements: {},

    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.elements = {
            form: document.querySelector('form'),
            inputs: document.querySelectorAll('input[type="text"]'),
            batchInput: document.querySelector('.batch-input'),
            checkboxes: document.querySelectorAll('input[type="checkbox"]'),
            btnProceed: document.querySelector('.btn-proceed')
        };
    },

    bindEvents() {
        // 1. Real-time Validation
        this.elements.form.addEventListener('input', () => this.checkFormState());
        
        // 2. Batch Code Formatting (Optional Uppercase)
        if (this.elements.batchInput) {
            this.elements.batchInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        // 3. Form Submission
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEntryAttempt();
        });
    },

    checkFormState() {
        // Check text inputs
        let allTextFilled = true;
        this.elements.inputs.forEach(input => {
            if (input.value.trim().length < 1) allTextFilled = false;
        });

        // Check checkboxes
        let allChecked = true;
        this.elements.checkboxes.forEach(cb => {
            if (!cb.checked) allChecked = false;
        });

        // Update Button State
        if (allTextFilled && allChecked) {
            this.elements.btnProceed.disabled = false;
            this.elements.btnProceed.style.opacity = "1";
            this.elements.btnProceed.style.cursor = "pointer";
        } else {
            this.elements.btnProceed.disabled = true;
            this.elements.btnProceed.style.opacity = "0.5";
            this.elements.btnProceed.style.cursor = "not-allowed";
        }
    },

    handleEntryAttempt() {
        const btn = this.elements.btnProceed;
        const originalText = btn.innerText;
        const batchCode = this.elements.batchInput.value.trim();

        // UI Loading Simulation
        btn.innerText = "Connecting...";
        btn.disabled = true;

        setTimeout(() => {
            // *** RELAXED LOGIC: ALWAYS SUCCESS FOR TESTING ***
            
            const studentData = {
                name: this.elements.inputs[0].value,
                roll: this.elements.inputs[2].value,
                batch: batchCode, 
                subject: "Mock Test Subject",
                startTime: Date.now()
            };

            // Save Session
            sessionStorage.setItem('active_exam_session', JSON.stringify(studentData));

            // Success UI
            btn.innerText = "Access Granted ✓";
            btn.style.backgroundColor = "#10b981";

            // REDIRECT TO DASHBOARD
            setTimeout(() => {
                // Yahan direct redirection lagaya hai
                window.location.href = 'dashboard-student.html'; 
            }, 500);

        }, 800); // Small delay for realism
    }
};