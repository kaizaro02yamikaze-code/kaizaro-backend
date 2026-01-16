/**
 * KAIZARO TEACHER DASHBOARD LOGIC
 */

'use strict';

const TeacherApp = {
    // --- MOCK DATABASE ---
    data: {
        students: [
            { id: "S01", name: "Rohan Das", attendance: "92%", avg: 88 },
            { id: "S02", name: "Priya Singh", attendance: "85%", avg: 72 },
            { id: "S03", name: "Amit Kumar", attendance: "78%", avg: 45 },
            { id: "S04", name: "Sneha Gupta", attendance: "95%", avg: 94 },
            { id: "S05", name: "Vikram Malhotra", attendance: "60%", avg: 33 }
        ],
        tests: [
            { id: "T-101", title: "Thermodynamics Unit 1", date: "2023-10-25", status: "Active", submissions: 12 },
            { id: "T-102", title: "Kinematics Pop Quiz", date: "2023-10-20", status: "Closed", submissions: 45 }
        ],
        recentActivity: [
            { name: "Rohan Das", test: "Thermodynamics", score: 90 },
            { name: "Amit Kumar", test: "Thermodynamics", score: 40 },
            { name: "Priya Singh", test: "Thermodynamics", score: 75 }
        ]
    },

    init() {
        lucide.createIcons();
        this.renderDashboard();
        this.renderRoster();
        this.renderExams();
    },

    // --- NAVIGATION ---
    switchTab(tabId, navEl) {
        // Switch Views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${tabId}`).classList.add('active');

        // Switch Nav Active State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(navEl) navEl.classList.add('active');
    },

    // --- RENDERING LOGIC ---
    renderDashboard() {
        // Calculate Stats
        const totalStudents = this.data.students.length;
        const classAvg = Math.round(this.data.students.reduce((acc, s) => acc + s.avg, 0) / totalStudents);
        const activeTests = this.data.tests.filter(t => t.status === "Active").length;

        // Update KPIs
        document.getElementById('kpi-students').innerText = totalStudents;
        document.getElementById('kpi-average').innerText = classAvg + "%";
        document.getElementById('kpi-average').style.color = classAvg > 75 ? "var(--success)" : "var(--warning)";
        document.getElementById('kpi-tests').innerText = activeTests;

        // Render Recent Table
        const tbody = document.getElementById('recent-table-body');
        tbody.innerHTML = this.data.recentActivity.map(act => `
            <tr>
                <td style="font-weight:500; color:white;">${act.name}</td>
                <td>${act.test}</td>
                <td>${act.score}%</td>
                <td><span class="badge ${act.score >= 50 ? 'badge-pass' : 'badge-fail'}">
                    ${act.score >= 50 ? 'PASS' : 'FAIL'}
                </span></td>
            </tr>
        `).join('');
    },

    renderRoster() {
        const tbody = document.getElementById('roster-table-body');
        tbody.innerHTML = this.data.students.map(s => `
            <tr>
                <td style="font-family:'JetBrains Mono'; color:var(--text-muted);">${s.id}</td>
                <td style="color:white; font-weight:500;">${s.name}</td>
                <td>${s.attendance}</td>
                <td style="color:${s.avg < 50 ? 'var(--danger)' : 'var(--success)'}">${s.avg}%</td>
                <td><button style="background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:4px 8px; border-radius:4px; cursor:pointer;">View</button></td>
            </tr>
        `).join('');
    },

    renderExams() {
        const container = document.getElementById('exams-container');
        container.innerHTML = this.data.tests.map(t => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px 24px;">
                <div>
                    <h3 style="color:white; font-size:1rem;">${t.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">ID: ${t.id} • ${t.date}</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem; font-weight:700; color:white;">${t.submissions}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">SUBMISSIONS</div>
                </div>
            </div>
        `).join('');
    },

    // --- ACTIONS ---
    createTest() {
        // 1. Simulate Test Creation
        const newTopic = prompt("Enter Test Topic Name (e.g. Optics):");
        if (!newTopic) return;

        const newId = "T-" + Math.floor(Math.random() * 900 + 100);
        
        // 2. Add to Local Mock Data
        const newTest = {
            id: newId,
            title: newTopic,
            date: new Date().toLocaleDateString(),
            status: "Active",
            submissions: 0
        };
        
        this.data.tests.unshift(newTest); // Add to top
        
        // 3. Save to LocalStorage (So Student Dashboard can see it!)
        // Note: The student dashboard code we wrote earlier looks for 'kaizaro_active_tests'
        // We will format it exactly how the student dashboard expects it.
        
        // Simple Question Generator for the Mock Test
        const mockQuestions = [
            { id: 1, text: `Basic question about ${newTopic}?`, options: ["Option A", "Option B", "Option C"], correct: 0 },
            { id: 2, text: `Advanced concept of ${newTopic}?`, options: ["True", "False"], correct: 0 }
        ];

        const exportTest = {
            id: newId,
            topic: newTopic,
            duration: "30",
            questions: mockQuestions,
            totalMarks: 20
        };

        // Get existing tests or empty array
        const existing = JSON.parse(localStorage.getItem('kaizaro_active_tests') || "[]");
        existing.unshift(exportTest);
        localStorage.setItem('kaizaro_active_tests', JSON.stringify(existing));

        // Also trigger the "New Test Alert" for student
        localStorage.setItem('kaizaro_new_test_alert', JSON.stringify({
            id: newId,
            topic: newTopic,
            timestamp: Date.now()
        }));

        // 4. Update UI
        this.renderDashboard();
        this.renderExams();
        alert(`Test '${newTopic}' Created & Published to Students!`);
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    TeacherApp.init();
});