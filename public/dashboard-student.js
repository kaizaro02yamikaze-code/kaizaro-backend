/**
 * KAIZARO STUDENT DASHBOARD LOGIC
 */

'use strict';

const StudentApp = {
    // Fake history data for demo
    history: [
        { id: "T-001", title: "Kinematics Drill", date: "Oct 10", score: 85, status: "Evaluated" },
        { id: "T-002", title: "Organic Chemistry", date: "Oct 15", score: 62, status: "Evaluated" }
    ],

    init() {
        lucide.createIcons();
        this.loadProfile();
        this.loadActiveTests();
        this.loadStats();
    },

    // --- NAVIGATION ---
    switchTab(tabId, navEl) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${tabId}`).classList.add('active');

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(navEl) navEl.classList.add('active');
    },

    // --- DATA LOADING ---
    loadProfile() {
        // Load from Setup
        const profile = JSON.parse(localStorage.getItem('kaizaro_student_profile'));
        if (profile) {
            document.getElementById('user-name').innerText = profile.name;
            document.getElementById('user-batch').innerText = `Batch: ${profile.batch} • Class ${profile.grade}`;
        }
    },

    loadActiveTests() {
        // 1. Get tests created by Teacher
        const activeTests = JSON.parse(localStorage.getItem('kaizaro_active_tests') || "[]");
        const container = document.getElementById('active-assignments-list');
        const examContainer = document.getElementById('all-exams-list');

        let html = '';
        
        if (activeTests.length === 0) {
            html = `<div style="padding:20px; text-align:center; color:var(--text-muted);">No active tests assigned.</div>`;
        } else {
            activeTests.forEach(test => {
                html += `
                    <div class="test-item">
                        <div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span class="tag tag-new">NEW</span>
                                <span style="color:white; font-weight:600;">${test.topic}</span>
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                                Duration: ${test.duration} Mins • Marks: ${test.totalMarks}
                            </div>
                        </div>
                        <button class="btn-primary" onclick="StudentApp.startTest('${test.id}')">
                            Start Exam <i data-lucide="arrow-right" size="16"></i>
                        </button>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
        examContainer.innerHTML = html; // Also show in Exams tab for now
        
        // Append history to Exams tab
        this.history.forEach(h => {
            examContainer.innerHTML += `
                <div class="test-item" style="opacity:0.7;">
                    <div>
                        <div style="color:white; font-weight:500;">${h.title}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">Score: ${h.score}% • ${h.date}</div>
                    </div>
                    <button class="btn-primary" style="background:transparent; border:1px solid var(--border);" disabled>View Report</button>
                </div>
            `;
        });

        if(window.lucide) lucide.createIcons();
    },

    loadStats() {
        // Check for latest result from Exam Engine
        const lastResult = JSON.parse(localStorage.getItem('kaizaro_last_result'));
        
        // Calculate average including fake history
        let totalScore = this.history.reduce((acc, h) => acc + h.score, 0);
        let count = this.history.length;

        if (lastResult) {
            totalScore += lastResult.score;
            count++;
            
            // Show AI Insight based on last result
            const insightBox = document.getElementById('ai-insight-box');
            const insightText = document.getElementById('ai-text');
            insightBox.style.display = 'flex';
            
            // Simple Logic for "AI" text
            const weakTopics = Object.keys(lastResult.weakTopics || {}).join(", ");
            if (lastResult.score < 50) {
                insightText.innerHTML = `Attention Needed: You scored <strong>${lastResult.score}%</strong> in the last test. <br>Weak Areas detected: <span style="color:var(--danger)">${weakTopics || 'General Concepts'}</span>. We recommend reviewing the Visual Learning module.`;
            } else {
                insightText.innerHTML = `Great Job! You scored <strong>${lastResult.score}%</strong>. Your grasp on <span style="color:var(--success)">${lastResult.examName || 'Physics'}</span> is improving. Keep it up!`;
            }
        }

        const avg = Math.round(totalScore / count);
        document.getElementById('stat-avg').innerText = avg + "%";
        document.getElementById('stat-tests').innerText = count;
    },

    // --- ACTIONS ---
    startTest(testId) {
        if(confirm("Start Exam? Ensure you have a stable internet connection.")) {
            localStorage.setItem('kaizaro_current_exam_id', testId);
            window.location.href = 'exam-engine.html';
        }
    },

    playSimulation(el) {
        if (!el.classList.contains('playing')) {
            el.classList.add('playing');
            // Can add more complex JS animation logic here if needed
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StudentApp.init();
});