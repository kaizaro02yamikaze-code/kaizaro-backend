
/**
 * TEACHER COMMAND CENTER - SUPABASE INTEGRATED
 */

const State = {
    profile: null,
    batches: [],
    tests: [],
    students: [],
    reports: [],
    generatedQuestions: [] // Temp storage for preview
};

const App = {
    async init() {
        if (window.lucide) lucide.createIcons();

        // Security
        const sessionData = await window.utils.checkSession(['teacher']);
        if (!sessionData) return;

        await this.loadData(sessionData.userProfile.id);
        this.renderAll();

        // Setup Form Listeners
        this.setupForms();
    },

    async loadData(userId) {
        const client = window.supabaseClient;

        // 1. Teacher Profile
        const { data: profile } = await client
            .from('teacher_profiles')
            .select('*, user:users(full_name)')
            .eq('user_id', userId)
            .single();

        if (profile) {
            State.profile = profile;
            document.getElementById('teacherName').innerText = profile.user.full_name || 'Teacher';
        }

        // 2. Batches assigned to Teacher
        const { data: batches } = await client
            .from('batches')
            .select('*')
            .eq('teacher_id', userId);

        State.batches = batches || [];

        // 3. Tests
        if (State.batches.length > 0) {
            const batchIds = State.batches.map(b => b.id);
            const { data: tests } = await client
                .from('tests')
                .select('*')
                .in('batch_id', batchIds)
                .order('created_at', { ascending: false });

            State.tests = tests || [];

            // 4. Students (via Student Profiles in these batches)
            const { data: students } = await client
                .from('student_profiles')
                .select('*, user:users(full_name, email)')
                .in('batch_id', batchIds);

            State.students = students || [];

            // 5. Basic Reporting Data (Attempts)
            // Fetch all attempts for these tests to calculate risks
            const testIds = State.tests.map(t => t.id);
            if (testIds.length > 0) {
                const { data: attempts } = await client
                    .from('attempts')
                    .select('*')
                    .in('test_id', testIds);

                // Process Reports
                State.reports = State.students.map(s => {
                    const studentAttempts = attempts.filter(a => a.student_id === s.user_id);
                    const avgScore = studentAttempts.length
                        ? (studentAttempts.reduce((sum, a) => sum + a.score, 0) / studentAttempts.length)
                        : 0;

                    return {
                        ...s,
                        avgScore,
                        risk: window.AICore.calculateRisk(avgScore),
                        attendance: 85 + Math.floor(Math.random() * 15) // Mock
                    };
                });
            }
        }
    },

    renderAll() {
        this.renderStats();
        this.renderTests();
        this.renderReports();
        this.renderAI();
    },

    renderStats() {
        if (document.getElementById('kpi-test-count'))
            document.getElementById('kpi-test-count').innerText = State.tests.length;

        const pendingEval = 0; // Automation handles it
        if (document.getElementById('kpi-eval-count'))
            document.getElementById('kpi-eval-count').innerText = pendingEval;
    },

    renderTests() {
        const tbody = document.getElementById('tests-table-body');
        if (!tbody) return;

        tbody.innerHTML = State.tests.map(t => `
            <tr>
                <td style="font-family:'JetBrains Mono'; color:var(--primary);">#${t.id.slice(0, 6)}</td>
                <td style="color:white; font-weight:600;">${t.topic}</td>
                <td>${new Date(t.created_at).toLocaleDateString()}</td>
                <td>${t.duration} Mins</td>
                <td><span class="status-badge status-active">ACTIVE</span></td>
            </tr>
        `).join('');
    },

    renderReports() {
        const tbody = document.getElementById('reports-table-body');
        if (!tbody) return;

        tbody.innerHTML = State.reports.map(r => {
            let riskColor = r.risk === 'HIGH' ? 'st-danger' : (r.risk === 'MEDIUM' ? 'st-warn' : 'st-success');
            return `
                 <tr>
                    <td style="color:white; font-weight:600;">${r.user.full_name}</td>
                    <td>${State.batches.find(b => b.id === r.batch_id)?.code || r.batch_id}</td>
                    <td style="font-weight:bold;">${Math.round(r.avgScore)}%</td>
                    <td>${r.attendance}%</td>
                    <td><span class="status-badge ${riskColor}">${r.risk} RISK</span></td>
                    <td><button class="btn-outline" style="padding:4px;" onclick="window.utils.showToast('Report Sent')">Report</button></td>
                </tr>
            `;
        }).join('');
    },

    renderAI() {
        const container = document.getElementById('ai-risk-container');
        if (!container) return;

        const highRisk = State.reports.filter(r => r.risk === 'HIGH');

        if (highRisk.length === 0) {
            container.innerHTML = '<span style="color:#aaa;">No Assessment Risks</span>';
        } else {
            container.innerHTML = highRisk.map(h => `
                <div style="background:rgba(239, 68, 68, 0.1); padding:10px; border-radius:4px; border:1px solid var(--danger);">
                    <div style="color:var(--danger); font-weight:700; font-size:0.8rem;">${h.user.full_name}</div>
                    <div style="font-size:0.7rem; color:#aaa;">Avg: ${Math.round(h.avgScore)}%</div>
                </div>
             `).join('');
        }

        // Batch Insight
        const insight = document.getElementById('ai-batch-insight');
        if (insight) {
            // Calculate Best Batch
            // Simplified logic
            insight.innerText = State.batches.length > 0
                ? `${State.batches.length} Batches Active. Syllabus execution is optimal.`
                : "No active batches found.";
        }
    },

    setupForms() {
        const form = document.getElementById('test-config-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                TestEngine.generatePreview();
            });
        }
    }
};

const Router = {
    navigate(viewId, btn) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');

        if (btn) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
        }
    },
    logout: () => window.Auth ? window.Auth.signOut() : window.location.href = 'index.html'
};

const TestEngine = {
    generatePreview() {
        const topic = document.getElementById('t-topic').value;
        const qCount = document.getElementById('t-qcount').value;

        // Mock Generation with some randomness to feel "AI"
        State.generatedQuestions = Array.from({ length: qCount }).map((_, i) => ({
            question_text: `Sample Question ${i + 1} regarding ${topic}?`,
            options_json: ["Option A", "Option B", "Option C", "Option D"],
            correct_option: 0 // Default A
        }));

        this.renderPreview();
        UI.openModal();
    },

    renderPreview() {
        const container = document.getElementById('preview-content');
        container.innerHTML = State.generatedQuestions.map((q, i) => `
            <div class="q-preview-item">
                <div style="font-weight:600; margin-bottom:10px; color:white;">Q${i + 1}: ${q.question_text}</div>
                <div class="q-options">
                    ${q.options_json.map(o => `<div class="q-option">${o}</div>`).join('')}
                </div>
            </div>
        `).join('');

        document.getElementById('preview-meta').innerText = `Generated ${State.generatedQuestions.length} Questions for ${document.getElementById('t-topic').value}`;
    },

    async publishTest() {
        const client = window.supabaseClient;
        const btn = document.querySelector('.modal-footer .btn-primary');
        const originalText = btn.innerText;
        btn.innerText = "Publishing...";
        btn.disabled = true;

        try {
            // 1. Create Test
            // Need batch ID. For now finding first match by code or name
            const batchCode = document.getElementById('t-batch').value;
            // Lookup batch
            const { data: batches } = await client.from('batches').select('id').eq('code', batchCode).single();
            // If no exact match, use first assigned batch or fail
            let batchId = batches?.id;
            if (!batchId && State.batches.length > 0) batchId = State.batches[0].id; // Fallback for MVP

            if (!batchId) throw new Error("Invalid Batch Code");

            const { data: test, error: tErr } = await client.from('tests').insert({
                batch_id: batchId,
                topic: document.getElementById('t-topic').value,
                total_marks: State.generatedQuestions.length * 4,
                duration: document.getElementById('t-duration').value
            }).select().single();

            if (tErr) throw tErr;

            // 2. Insert Questions
            const questions = State.generatedQuestions.map(q => ({
                test_id: test.id,
                question_text: q.question_text,
                options_json: q.options_json,
                correct_option: q.correct_option
            }));

            const { error: qErr } = await client.from('questions').insert(questions);
            if (qErr) throw qErr;

            window.utils.showToast("Test Published Successfully!", "success");
            UI.closeModal();
            App.loadData(State.profile.user_id).then(() => App.renderTests());

        } catch (e) {
            console.error(e);
            window.utils.showToast("Error publishing test: " + e.message, "error");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    simulateSubmit() {
        alert("This feature simulates a student taking the test. Available in Student Dashboard.");
    }
};

const UI = {
    openModal: () => document.getElementById('preview-modal').style.display = 'grid',
    closeModal: () => document.getElementById('preview-modal').style.display = 'none'
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.Router = Router;
window.TestEngine = TestEngine;
window.UI = UI;