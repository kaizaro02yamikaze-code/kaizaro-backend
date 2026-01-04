/**
 * KAIZARO TEACHER COMMAND CENTER (ENTERPRISE EDITION)
 * ---------------------------------------------------
 * This file handles the entire logic for the Teacher Dashboard.
 * Modules:
 * 1. MockDB: Central Data Store (Simulated Backend)
 * 2. State: Manages volatile app state (Drafts, Uploads)
 * 3. Router: Handles navigation and view switching
 * 4. UI: Renderers for different sections (Dash, Reports, Eval)
 * 5. TestEngine: AI Generation, Preview, Publishing Logic
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// =============================================================================
// 1. MOCK DATABASE (Simulating a Real Backend)
// =============================================================================
const MockDB = {
    // Teacher Profile
    profile: {
        name: "Dr. A. Sharma",
        dept: "Physics (Advanced)",
        email: "a.sharma@kaizaro.edu",
        stats: {
            students: 42,
            testsRun: 12,
            evalPending: 3
        }
    },

    // Detailed Student Roster with Performance Metrics
    students: [
        { id: "S01", name: "Rohan Das", batch: "PHY-101", score: 45, attendance: 78, risk: "HIGH", notes: "Weak in Thermodynamics concepts." },
        { id: "S02", name: "Priya Sharma", batch: "PHY-101", score: 92, attendance: 96, risk: "LOW", notes: "Top performer. Recommended for Olympiad." },
        { id: "S03", name: "Amit Kumar", batch: "PHY-102", score: 62, attendance: 82, risk: "MEDIUM", notes: "Needs improvement in numerical solving speed." },
        { id: "S04", name: "Vikram Singh", batch: "PHY-102", score: 35, attendance: 60, risk: "HIGH", notes: "Frequent absentee. Parent meeting required." },
        { id: "S05", name: "Sneha Gupta", batch: "PHY-101", score: 88, attendance: 91, risk: "LOW", notes: "Consistent performance." }
    ],

    // Evaluation Queue (Tests waiting for manual grading)
    evaluations: [
        { id: "E-101", student: "Rohan Das", test: "Unit Test 3", submitted: "2 hrs ago", status: "Pending" },
        { id: "E-102", student: "Vikram Singh", test: "Mid-Term Physics", submitted: "1 day ago", status: "Pending" },
        { id: "E-103", student: "Amit Kumar", test: "Unit Test 3", submitted: "3 hrs ago", status: "In Progress" }
    ],

    // Question Templates for AI Generation
    templates: {
        generic: [
            { text: "Define the core principle of {topic}.", options: ["Principle A", "Principle B", "Principle C", "Principle D"] },
            { text: "Calculate the value if variable X is doubled in {topic}.", options: ["2X", "4X", "X/2", "Same"] },
            { text: "Which of the following is NOT related to {topic}?", options: ["Factor 1", "Factor 2", "Outlier", "Factor 3"] },
            { text: "In a closed system, how does {topic} behave?", options: ["Increases", "Decreases", "Remains Constant", "Fluctuates"] },
            { text: "Who is the father of {topic}?", options: ["Newton", "Einstein", "Tesla", "Curie"] }
        ]
    }
};

// =============================================================================
// 2. APP STATE & INIT
// =============================================================================
const AppState = {
    currentDraft: null, // Stores the test currently being created
    uploadedFile: null, // Stores metadata of uploaded PDF
};

const App = {
    init() {
        if (window.lucide) lucide.createIcons();
        
        // Initial Render
        UI.renderDashboard();
        UI.renderReports();
        UI.renderEvaluationQueue();
        UI.renderSettings();
        
        // Bind Global Events
        this.bindEvents();
        
        // Check for existing tests
        UI.updateRecentTestsTable();
    },

    bindEvents() {
        // File Upload Click Trigger
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('pdf-upload');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => TestEngine.handleFileUpload(e));
        }

        // Test Generation Form Submit
        const form = document.getElementById('test-config-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                TestEngine.generatePreview();
            });
        }
    }
};

// =============================================================================
// 3. ROUTER (View Navigation)
// =============================================================================
const Router = {
    navigate(viewId, navItem) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        // Show target view
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.add('active');
            
            // Trigger specific renders if needed
            if (viewId === 'view-dashboard') UI.renderDashboard();
            if (viewId === 'view-eval') UI.renderEvaluationQueue();
        }

        // Update Sidebar UI
        if (navItem) {
            // Clicked from Sidebar
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            navItem.classList.add('active');
        } else {
            // Navigate Programmatically (e.g. "New Test" button)
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            // Map view IDs to Sidebar IDs manually for safety
            if (viewId === 'view-qbank') document.getElementById('nav-qbank').classList.add('active');
            if (viewId === 'view-dashboard') document.getElementById('nav-dashboard').classList.add('active');
        }
        
        if(window.lucide) lucide.createIcons();
    },

    logout() {
        if(confirm("Securely sign out of Teacher Command Center?")) {
            window.location.href = 'index.html';
        }
    }
};

// =============================================================================
// 4. TEST ENGINE (AI Logic & Publishing)
// =============================================================================
const TestEngine = {
    handleFileUpload(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            AppState.uploadedFile = file;
            
            // Visual Update
            const label = document.getElementById('file-label');
            label.innerHTML = `
                <div style="color:var(--success); display:flex; flex-direction:column; align-items:center;">
                    <i data-lucide="file-check" style="margin-bottom:5px;"></i>
                    <span style="font-weight:bold;">${file.name}</span>
                    <span style="font-size:0.75rem; opacity:0.8;">Ready for AI Analysis</span>
                </div>
            `;
            if(window.lucide) lucide.createIcons();
        }
    },

    generatePreview() {
        const topic = document.getElementById('t-topic').value;
        const qCount = parseInt(document.getElementById('t-qcount').value);
        const duration = document.getElementById('t-duration').value;
        const batch = document.getElementById('t-batch').value;

        // Validation
        if (!AppState.uploadedFile) {
            UI.showToast("Please upload a source PDF first.", "warning");
            // For demo purposes, we will proceed anyway but warn
        }

        // UI Loading State
        const btn = document.querySelector('#test-config-form button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Processing...`;
        btn.disabled = true;
        if(window.lucide) lucide.createIcons();

        // Simulate AI Delay (1.5s)
        setTimeout(() => {
            // Generate Questions
            const questions = [];
            const templates = MockDB.templates.generic;
            
            for(let i = 0; i < qCount; i++) {
                const temp = templates[i % templates.length];
                questions.push({
                    id: i + 1,
                    text: temp.text.replace("{topic}", topic),
                    options: temp.options,
                    correct: 0 // Default logic
                });
            }

            // Create Draft Object
            AppState.currentDraft = {
                id: 'TEST-' + Math.floor(Math.random() * 9000 + 1000),
                topic: topic,
                batch: batch || "All Batches",
                duration: duration,
                questions: questions,
                totalMarks: qCount * 4,
                date: new Date().toLocaleDateString()
            };

            // Open Preview
            UI.renderPreviewModal(AppState.currentDraft);
            
            // Reset Button
            btn.innerHTML = oldText;
            btn.disabled = false;
            if(window.lucide) lucide.createIcons();
        }, 1500);
    },

    simulateSubmit() {
        // Just a fun visual feature for the teacher to see "what if"
        const inputs = document.querySelectorAll('#preview-content input[type="radio"]');
        // Randomly check some boxes
        let score = 0;
        inputs.forEach(input => {
            if(Math.random() > 0.7) {
                input.checked = true;
                // If it's the first option (index 0), it's "correct" in our mock logic
                if(input.id.endsWith('opt-0')) score++; 
            }
        });
        alert(`Simulation Complete.\nRandom AI Student Score: ${score}/${AppState.currentDraft.questions.length}`);
    },

    publishTest() {
        if (!AppState.currentDraft) return;

        // 1. Save to LocalStorage (Persistence)
        let activeTests = JSON.parse(localStorage.getItem('kaizaro_active_tests') || "[]");
        activeTests.unshift(AppState.currentDraft);
        localStorage.setItem('kaizaro_active_tests', JSON.stringify(activeTests));

        // 2. Set Alert Flag for Student Dashboard
        localStorage.setItem('kaizaro_new_test_alert', JSON.stringify({
            topic: AppState.currentDraft.topic,
            id: AppState.currentDraft.id,
            timestamp: Date.now()
        }));

        // 3. UI Feedback
        UI.closeModal();
        UI.showToast("Test Published Successfully!");
        
        // 4. Update Stats
        MockDB.profile.stats.testsRun++;
        
        // 5. Navigate
        UI.updateRecentTestsTable();
        Router.navigate('view-dashboard');
        
        // 6. Reset Form
        document.getElementById('test-config-form').reset();
        document.getElementById('file-label').innerText = "Click to Browse or Drag PDF here";
        AppState.currentDraft = null;
        AppState.uploadedFile = null;
    }
};

// =============================================================================
// 5. UI RENDERERS
// =============================================================================
const UI = {
    renderDashboard() {
        // Update KPIs
        document.getElementById('kpi-test-count').innerText = MockDB.profile.stats.testsRun;
        document.getElementById('kpi-eval-count').innerText = MockDB.profile.stats.evalPending;

        // Render AI Insights
        const riskContainer = document.getElementById('ai-risk-container');
        const batchInsight = document.getElementById('ai-batch-insight');
        
        if (riskContainer) {
            const riskyStudents = MockDB.students.filter(s => s.risk === 'HIGH');
            if (riskyStudents.length > 0) {
                riskContainer.innerHTML = riskyStudents.map(s => 
                    `<span class="status-badge st-danger">${s.name}</span>`
                ).join('');
            } else {
                riskContainer.innerHTML = `<span class="status-badge st-success">No High Risk Students</span>`;
            }
        }
        
        if (batchInsight) {
            batchInsight.innerText = `Batch PHY-101 has shown a 12% improvement in concept retention.`;
        }

        this.updateRecentTestsTable();
    },

    updateRecentTestsTable() {
        const tbody = document.getElementById('tests-table-body');
        const lsTests = JSON.parse(localStorage.getItem('kaizaro_active_tests') || "[]");
        
        if (lsTests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#555; padding:20px;">No active tests found. Create one!</td></tr>`;
            return;
        }

        tbody.innerHTML = lsTests.map(t => `
            <tr>
                <td style="color:var(--primary); font-family:'JetBrains Mono'">${t.id}</td>
                <td style="font-weight:600; color:white;">${t.topic}</td>
                <td>${t.date}</td>
                <td>${t.duration}</td>
                <td><span class="status-badge status-active">LIVE</span></td>
            </tr>
        `).join('');
    },

    renderReports() {
        const tbody = document.getElementById('reports-table-body');
        if (!tbody) return;

        tbody.innerHTML = MockDB.students.map(s => {
            const riskClass = s.risk === 'HIGH' ? 'st-danger' : (s.risk === 'MEDIUM' ? 'st-warn' : 'st-success');
            const scoreColor = s.score < 50 ? 'var(--danger)' : 'var(--success)';
            
            return `
            <tr>
                <td style="color:white; font-weight:500;">${s.name}</td>
                <td>${s.batch}</td>
                <td style="color:${scoreColor}; font-weight:bold;">${s.score}%</td>
                <td>${s.attendance}%</td>
                <td><span class="status-badge ${riskClass}">${s.risk}</span></td>
                <td><button class="btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="UI.showStudentInfo('${s.id}')">Analysis</button></td>
            </tr>
            `;
        }).join('');
    },

    renderEvaluationQueue() {
        const container = document.getElementById('view-eval');
        if (!container) return;

        let html = `
            <div class="header">
                <div class="title">
                    <h1>Evaluation Queue</h1>
                    <p>Manual grading required for subjective answers.</p>
                </div>
            </div>
            <div class="card">
                <table>
                    <thead><tr><th>ID</th><th>Student</th><th>Test Name</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
        `;

        html += MockDB.evaluations.map(ev => `
            <tr>
                <td style="color:var(--text-muted);">${ev.id}</td>
                <td style="color:white; font-weight:500;">${ev.student}</td>
                <td>${ev.test}</td>
                <td>${ev.submitted}</td>
                <td><span class="status-badge st-warn">${ev.status}</span></td>
                <td>
                    <button class="btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="UI.startGrading('${ev.id}')">
                        Grade
                    </button>
                </td>
            </tr>
        `).join('');

        html += `</tbody></table></div>`;
        container.innerHTML = html;
    },

    renderSettings() {
        const container = document.getElementById('view-settings');
        if (!container) return;

        container.innerHTML = `
            <div class="header">
                <div class="title">
                    <h1>Settings</h1>
                    <p>Manage your profile and classroom preferences.</p>
                </div>
            </div>
            <div class="card" style="max-width: 600px;">
                <h3 style="margin-bottom:20px;">Profile Details</h3>
                <div class="form-grid">
                    <div><label>Full Name</label><input type="text" value="${MockDB.profile.name}"></div>
                    <div><label>Department</label><input type="text" value="${MockDB.profile.dept}"></div>
                    <div><label>Email</label><input type="email" value="${MockDB.profile.email}" disabled style="opacity:0.5;"></div>
                </div>
                
                <h3 style="margin-bottom:20px; margin-top:30px;">Preferences</h3>
                <div class="form-grid">
                    <div><label>Default Test Duration</label><select><option>30 Mins</option><option>60 Mins</option></select></div>
                    <div><label>AI Strictness</label><select><option>Moderate</option><option>High</option></select></div>
                </div>

                <div style="margin-top:30px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary" onclick="UI.showToast('Settings Saved Successfully!')">Save Changes</button>
                </div>
            </div>
        `;
    },

    renderPreviewModal(data) {
        document.getElementById('preview-meta').innerText = `${data.topic} | ${data.questions.length} Q | ${data.duration}`;
        const container = document.getElementById('preview-content');
        
        container.innerHTML = data.questions.map((q, idx) => `
            <div class="q-preview-item">
                <h4 style="color:white; font-size:0.95rem;">Q${q.id}. ${q.text}</h4>
                <div class="q-options">
                    ${q.options.map((opt, oIdx) => `
                        <div class="q-option">
                            <input type="radio" name="prev-q-${idx}" id="prev-q-${idx}-${oIdx}">
                            <label for="prev-q-${idx}-${oIdx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.getElementById('preview-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('preview-modal').style.display = 'none';
    },

    showToast(msg, type = "success") {
        const toast = document.getElementById('toast');
        const icon = type === "success" ? "check-circle" : "alert-circle";
        const color = type === "success" ? "#10B981" : "#EF4444";
        
        toast.innerHTML = `<i data-lucide="${icon}" style="display:inline; margin-right:8px; width:16px;"></i> ${msg}`;
        toast.style.backgroundColor = color;
        toast.classList.add('show');
        
        if(window.lucide) lucide.createIcons();
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    showStudentInfo(id) {
        const s = MockDB.students.find(stu => stu.id === id);
        alert(`ID: ${s.id}\nName: ${s.name}\nBatch: ${s.batch}\nRisk Factor: ${s.risk}\n\nNotes: ${s.notes}`);
    },

    startGrading(id) {
        const evaluation = MockDB.evaluations.find(e => e.id === id);
        const score = prompt(`Grading ${evaluation.student} for ${evaluation.test}.\n\nEnter Score (0-100):`, "85");
        if(score) {
            UI.showToast(`Graded ${evaluation.student}: ${score}/100`);
            // In a real app, update DB here. For demo, we just toast.
        }
    }
};

// =============================================================================
// 6. EXPORTS
// =============================================================================
// Expose specific functions to the global window object for HTML onclick attributes
window.Router = Router;
window.UI = UI;
window.TestEngine = TestEngine;