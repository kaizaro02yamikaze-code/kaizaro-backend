/**
 * KAIZARO EXAM ENGINE
 * Handles test delivery, timing, and result generation.
 */

'use strict';

const ExamEngine = {
    // State
    currentQIndex: 0,
    answers: {}, // Stores user answers { qIndex: optionIndex }
    reviewList: new Set(),
    questions: [],
    timer: null,
    timeLeft: 1800, // Default 30 mins (in seconds)

    init() {
        if(window.lucide) lucide.createIcons();
        this.loadExamData();
        this.renderPalette();
        this.loadQuestion(0);
        this.startTimer();
        
        // Anti-Cheat (Optional - Uncomment for strict mode)
        /*
        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) {
               document.getElementById('security-overlay').style.display = 'flex';
            } else {
               document.getElementById('security-overlay').style.display = 'none';
            }
        });
        */
    },

    loadExamData() {
        // 1. Try to get ID from Student Dashboard link
        const examId = localStorage.getItem('kaizaro_current_exam_id');
        
        // 2. Try to find actual test data published by Teacher
        const allTests = JSON.parse(localStorage.getItem('kaizaro_active_tests') || "[]");
        const realTest = allTests.find(t => t.id === examId);

        if (realTest) {
            this.questions = realTest.questions;
            // Convert duration (minutes) to seconds. Default to 30 mins if missing.
            this.timeLeft = (parseInt(realTest.duration) || 30) * 60; 
            document.getElementById('exam-subject').innerText = realTest.topic;
        } else {
            // 3. Fallback: Generate Fake Data if no real test found (Demo Mode)
            // Default to 30 questions for demo
            this.generateFakeQuestions(30); 
            document.getElementById('exam-subject').innerText = "Physics: Mixed Drill (Demo)";
            this.timeLeft = 30 * 60; // 30 mins default
        }
    },

    generateFakeQuestions(count) {
        const topics = ["Thermodynamics", "Kinematics", "Optics", "Electromagnetism", "Modern Physics"];
        for(let i=0; i<count; i++) {
            const topic = topics[i % topics.length];
            this.questions.push({
                id: i+1,
                text: `Question ${i+1}: Which of the following principles best describes the core concept of <strong>${topic}</strong> in a closed system?`,
                options: [
                    `The conservation of energy within ${topic}`,
                    `The rate of change of momentum is zero`,
                    `Entropy decreases in an isolated system`,
                    `None of the above options are correct`
                ],
                correct: 0, // Always first option for demo simplicity
                topic: topic // Used for AI analysis
            });
        }
    },

    startTimer() {
        const display = document.getElementById('timer-display');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            const m = Math.floor(this.timeLeft / 60);
            const s = this.timeLeft % 60;
            
            // Format time as MM:SS
            display.innerHTML = `<i data-lucide="clock" size="16" style="margin-right:5px"></i> ${m}:${s < 10 ? '0'+s : s}`;

            // Warning colors
            if (this.timeLeft <= 300) display.classList.add('timer-warning'); // Red if < 5 mins

            // Auto-submit
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                alert("Time's Up! Submitting your exam automatically.");
                this.submitExam();
            }
        }, 1000);
        
        // Initial icon render inside timer
        if(window.lucide) lucide.createIcons();
    },

    // --- RENDERING ---
    loadQuestion(index) {
        this.currentQIndex = index;
        const q = this.questions[index];

        // Update UI
        document.getElementById('q-num').innerText = index + 1;
        document.getElementById('q-content').innerHTML = q.text;
        
        // Render Options
        const container = document.getElementById('options-container');
        container.innerHTML = q.options.map((opt, i) => `
            <div class="option-card ${this.answers[index] === i ? 'selected' : ''}" onclick="ExamEngine.selectOption(${i})">
                <div class="option-circle"></div>
                <span>${opt}</span>
            </div>
        `).join('');

        // Buttons state
        const isLast = index === this.questions.length - 1;
        document.getElementById('btn-next').style.display = isLast ? 'none' : 'block';
        document.getElementById('btn-submit').style.display = isLast ? 'block' : 'none';
        
        this.updatePalette();
    },

    renderPalette() {
        const container = document.getElementById('palette-container');
        container.innerHTML = this.questions.map((_, i) => `
            <div class="q-btn" id="pal-${i}" onclick="ExamEngine.loadQuestion(${i})">${i+1}</div>
        `).join('');
    },

    updatePalette() {
        // Reset and apply classes to all palette buttons
        document.querySelectorAll('.q-btn').forEach((btn, i) => {
            btn.className = 'q-btn'; // Base class
            
            if (i === this.currentQIndex) btn.classList.add('current');
            if (this.answers[i] !== undefined) btn.classList.add('answered');
            if (this.reviewList.has(i)) btn.classList.add('review');
        });
    },

    // --- INTERACTIONS ---
    selectOption(optIndex) {
        this.answers[this.currentQIndex] = optIndex;
        this.loadQuestion(this.currentQIndex); // Re-render to show selection immediately
    },

    nextQuestion() {
        if (this.currentQIndex < this.questions.length - 1) {
            this.loadQuestion(this.currentQIndex + 1);
        }
    },

    prevQuestion() {
        if (this.currentQIndex > 0) {
            this.loadQuestion(this.currentQIndex - 1);
        }
    },

    markForReview() {
        if (this.reviewList.has(this.currentQIndex)) {
            this.reviewList.delete(this.currentQIndex);
        } else {
            this.reviewList.add(this.currentQIndex);
        }
        this.updatePalette();
    },

    // --- SUBMISSION & AI ANALYSIS ---
    submitExam() {
        // If triggered manually, ask confirmation. If auto (time up), skip.
        if(this.timeLeft > 0 && !confirm("Are you sure you want to submit your test?")) return;

        clearInterval(this.timer);

        // 1. Calculate Score & Weak Areas
        let correctCount = 0;
        let weakTopicsMap = {}; // { "Thermodynamics": 2 errors, ... }

        this.questions.forEach((q, index) => {
            const userAns = this.answers[index];
            if (userAns === q.correct) {
                correctCount++;
            } else if (userAns !== undefined) {
                // Wrong Answer -> Track Weak Topic
                // Use the question's specific topic or fallback to a general one
                const topic = q.topic || "General Concepts";
                weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
            }
        });

        const scorePercentage = Math.round((correctCount / this.questions.length) * 100);

        // 2. Prepare Result Data
        const resultData = {
            score: scorePercentage,
            correct: correctCount,
            total: this.questions.length,
            weakTopics: weakTopicsMap, // AI will use this on dashboard
            date: new Date().toLocaleDateString(),
            examName: document.getElementById('exam-subject').innerText
        };

        // 3. Save to LocalStorage for Dashboard to read
        localStorage.setItem('kaizaro_last_result', JSON.stringify(resultData));

        // 4. Redirect
        window.location.href = 'dashboard-student.html';
    }
};

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
    ExamEngine.init();
});