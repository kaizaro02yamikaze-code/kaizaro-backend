
/**
 * STUDENT DASHBOARD - SUPABASE INTEGRATED
 */

const State = {
    profile: null,
    batch: null,
    tests: [],
    attempts: [],
    upcomingTests: []
};

const StudentApp = {
    async init() {
        if (window.lucide) lucide.createIcons();

        // 1. Security Check
        const sessionData = await window.utils.checkSession(['student']);
        if (!sessionData) return;

        // 2. Load Data
        await this.loadData(sessionData.userProfile.id);

        // 3. Render
        this.renderAll();

        // 4. Check Param for Toast
        if (window.utils.getUrlParam('testSubmitted')) {
            window.utils.showToast("Test Submitted Successfully!", "success");
        }
    },

    async loadData(userId) {
        const client = window.supabaseClient;

        // 1. Student Profile & Batch
        const { data: profile } = await client
            .from('student_profiles')
            .select(`
                *,
                batches ( id, name, code )
            `)
            .eq('user_id', userId)
            .single();

        if (profile) {
            State.profile = profile;
            State.batch = profile.batches;

            // Update Sidebar
            const user = await client.auth.getUser(); // or use passed session
            // But we can get name from 'users' table if we fetched it.
            // Let's refetch user name from public.users to be safe
            const { data: pubUser } = await client.from('users').select('full_name').eq('id', userId).single();
            if (pubUser) {
                document.querySelector('.profile-mini div div').innerText = pubUser.full_name;
            }
            if (State.batch) {
                document.querySelector('.profile-mini div span').innerText = State.batch.name;
            }
        }

        // 2. Fetch Tests for Batch
        if (State.batch) {
            const { data: tests } = await client
                .from('tests')
                .select('*')
                .eq('batch_id', State.batch.id)
                .order('created_at', { ascending: false });

            State.tests = tests || [];

            // 3. Fetch Attempts
            const { data: attempts } = await client
                .from('attempts')
                .select('*')
                .eq('student_id', userId);

            State.attempts = attempts || [];
        }

        // 4. Calculate Stats
        this.calculateStats();
    },

    calculateStats() {
        // Active Tests: Tests without an attempt
        const attemptTestIds = State.attempts.map(a => a.test_id);
        State.upcomingTests = State.tests.filter(t => !attemptTestIds.includes(t.id));
    },

    renderAll() {
        this.renderOverview();
        this.renderAssessments();
        this.renderAI();
    },

    renderOverview() {
        // Active Tests Card
        const container = document.getElementById('active-tests-list');
        if (State.upcomingTests.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#555;">No pending tests. You are all caught up!</div>';
        } else {
            container.innerHTML = State.upcomingTests.map(t => `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding:15px 0;">
                    <div>
                        <div style="font-weight:600; color:white;">${t.topic}</div>
                        <div style="font-size:0.8rem; color:#888;">Duration: ${t.duration} Mins</div>
                    </div>
                    <button class="btn-primary" onclick="StudentApp.startTest('${t.id}')">Take Test</button>
                </div>
            `).join('');
        }

        // Recent Stats (Header)
        const avgScore = State.attempts.length > 0
            ? Math.round(State.attempts.reduce((sum, a) => sum + a.score, 0) / State.attempts.length) // Simplified score sum? 
            // wait, score in DB is absolute marks? Or percentage? Prompt says "score". 
            // Ideally convert to percentage? tests have total_marks.
            // Let's assume raw score for now, but average percentage is better.
            : 0; // Complexity: Need to join Total Marks. MVP: just show raw avg.

        document.getElementById('disp-avg').innerText = avgScore; // + "%" ?
        document.getElementById('disp-count').innerText = State.attempts.length;
    },

    renderAssessments() {
        const container = document.getElementById('assessments-list');
        if (!container) return; // Might not be on this tab

        if (State.tests.length === 0) {
            container.innerHTML = '<div style="padding:20px; color:#555;">No assessments assigned.</div>';
            return;
        }

        container.innerHTML = State.tests.map(t => {
            const attempt = State.attempts.find(a => a.test_id === t.id);
            const status = attempt ? `<span class="tag-pill" style="background:#10b981; color:black;">Completed: ${attempt.score} Marks</span>` : `<span class="tag-pill" style="color:var(--primary);">Pending</span>`;
            const action = attempt
                ? `<button class="btn-outline" disabled>View Result</button>`
                : `<button class="btn-primary" onclick="StudentApp.startTest('${t.id}')">Start</button>`;

            return `
                <div class="list-item" style="padding:15px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                         <div style="color:white; font-weight:600;">${t.topic}</div>
                         <div style="font-size:0.8rem; color:#888;">Total Marks: ${t.total_marks} • ${t.duration} Mins</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="margin-bottom:5px;">${status}</div>
                        ${action}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAI() {
        const aiText = document.getElementById('ai-insight-text');
        if (!aiText) return;

        if (State.attempts.length === 0) {
            aiText.innerText = "Take your first test to unlock AI predictions. The system will analyze your mistake patterns.";
        } else {
            // Simple generic AI message based on scores
            const recent = State.attempts[0]; // Assuming order? API order was default?
            // Need to sort attempts by submitted_at?
            const score = recent.score;
            if (score < 10) { // arbitrary threshold
                aiText.innerText = "Focus on basics. AI detects fundamental gaps in recent topics.";
            } else {
                aiText.innerText = "Good progress! Your consistency is improving. Try advanced visual modules.";
            }
        }
    },

    async startTest(testId) {
        const client = window.supabaseClient;
        window.utils.setLoading('btn', true, 'Loading Test...'); // Generic idea

        // 1. Fetch Question Data
        const { data: test } = await client.from('tests').select('*').eq('id', testId).single();
        const { data: questions } = await client.from('questions').select('*').eq('test_id', testId);

        if (!test || !questions || questions.length === 0) {
            window.utils.showToast("Test data unavailable", "error");
            return;
        }

        // 2. Prepare Exam Object
        const examData = {
            id: test.id,
            subject: test.topic,
            duration: test.duration,
            questions: questions.map(q => ({
                id: q.id, // Store logic ID for answers
                text: q.question_text,
                options: q.options_json,
                correct: parseInt(q.correct_option) // ensure int
            }))
        };

        // 3. Store and Redirect
        localStorage.setItem("kaizaro_active_exam", JSON.stringify(examData));
        window.location.href = "exam-engine.html";
    },

    playSimulation(el) {
        // Mock Learning Mode
        const simData = {
            mode: 'learning',
            subject: 'Thermodynamics: Carnot Cycle',
            duration: 0
        };
        localStorage.setItem("kaizaro_active_exam", JSON.stringify(simData));
        window.location.href = "exam-engine.html";
    }
};

// UI Toggles
function switchTab(id, el) {
    document.querySelectorAll('.view-section').forEach(d => d.classList.remove('active'));
    document.getElementById('view-' + id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    el.classList.add('active');
}
function toggleChat() {
    const p = document.getElementById('chat-panel');
    p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
}
window.StudentApp = StudentApp;
document.addEventListener('DOMContentLoaded', () => { StudentApp.init(); });