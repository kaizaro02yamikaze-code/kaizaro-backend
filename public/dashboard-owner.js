
/**
 * OWNER COMMAND CENTER - SUPABASE INTEGRATED
 */

// Global State
const State = {
    institute: null,
    teachers: [],
    batches: [],
    students: [],
    invitationCodes: [],
    aiRisks: [],
    resolvedFlags: new Set()
};

// --- 1. APP CONTROLLER ---
const App = {
    async init() {
        // Init Icons
        if (window.lucide) lucide.createIcons();

        // Spinner Style
        const style = document.createElement('style');
        style.innerHTML = `
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        // Security Check
        const sessionData = await window.utils.checkSession(['owner']);
        if (!sessionData) return;

        // Load Real Data
        await this.loadData(sessionData.userProfile.id);

        // Run AI Engine on Real Data
        this.generateAIInsights();

        // Render
        this.renderAll();

        // Setup Realtime Subscription (Optional for MVP, skipping for simplicity)
    },

    async loadData(ownerId) {
        try {
            const client = window.supabaseClient;

            // 1. Get Institute
            const { data: inst, error: instErr } = await client
                .from('institutes')
                .select('*')
                .eq('owner_id', ownerId)
                .single();

            if (instErr) {
                console.error('Institute load error', instErr);
                // If no institute, maybe redirect to setup? But session check should have handled it.
                return;
            }
            State.institute = inst;

            // 2. Get Teachers (Profiles + Users)
            // We need to join with users to get names.
            const { data: teachers, error: tErr } = await client
                .from('teacher_profiles')
                .select(`
                    id, 
                    user_id,
                    users ( full_name, email )
                `)
                .eq('institute_id', inst.id);

            if (teachers) State.teachers = teachers.map(t => ({
                id: t.id,
                name: t.users?.full_name || 'Unknown',
                email: t.users?.email,
                subject: 'General', // Schema doesn't have subject in teacher_profile? Prompt didn't specify. Mocking.
                salary_status: Math.random() > 0.8 ? 'DUE' : 'PAID', // Mocking Finance
                salary_amount: 1000 + Math.floor(Math.random() * 500) // Mocking
            }));

            // 3. Get Batches
            const { data: batches, error: bErr } = await client
                .from('batches')
                .select('*')
                .eq('institute_id', inst.id);

            if (batches) State.batches = batches;

            // 4. Get Students (via batches)
            // We need all student profiles where batch_id is in our batches.
            const batchIds = State.batches.map(b => b.id);
            if (batchIds.length > 0) {
                const { data: students, error: sErr } = await client
                    .from('student_profiles')
                    .select(`
                        id, 
                        batch_id,
                        users ( full_name, email )
                    `)
                    .in('batch_id', batchIds);

                if (students) State.students = students.map(s => ({
                    id: s.id,
                    name: s.users?.full_name || 'Student',
                    batch_id: s.batch_id,
                    fee_status: Math.random() > 0.9 ? 'PENDING' : 'PAID', // Mocking
                    fee_amount: 500 // Mocking
                }));
            }

            // 5. Get Invitation Codes (Active)
            const { data: codes } = await client
                .from('invitation_codes')
                .select('*')
                .eq('institute_id', inst.id)
                .eq('is_used', false);

            if (codes) State.invitationCodes = codes;

            // 6. Calculate Metrics (Test Scores for Batches)
            // We need to fetch attempts for these batches to calculate scores.
            // This might be heavy, but for MVP it's fine.
            if (batchIds.length > 0) {
                const { data: tests } = await client.from('tests').select('id, batch_id').in('batch_id', batchIds);
                const testIds = tests?.map(t => t.id) || [];

                let attempts = [];
                if (testIds.length > 0) {
                    const { data: att } = await client.from('attempts').select('score, test_id').in('test_id', testIds);
                    attempts = att || [];
                }

                // Process Batches with Scores
                State.batches = State.batches.map(b => {
                    const batchTests = tests?.filter(t => t.batch_id === b.id).map(t => t.id) || [];
                    const batchAttempts = attempts.filter(a => batchTests.includes(a.test_id));
                    const avgScore = batchAttempts.length ? (batchAttempts.reduce((sum, a) => sum + a.score, 0) / batchAttempts.length) : 0;

                    return {
                        ...b,
                        score: Math.round(avgScore),
                        syllabus: Math.floor(Math.random() * 100), // Mocking syllabus
                        attendance: 80 + Math.floor(Math.random() * 20), // Mocking attendance
                        status: window.AICore.analyzeBatchHealth(avgScore)
                    };
                });
            }

        } catch (e) {
            console.error("Data Load Error", e);
            window.utils.showToast("Failed to load dashboard data", "error");
        }
    },

    navigate(viewId, btn) {
        if (btn) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
        }
        document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
        const activeView = document.getElementById(`view-${viewId}`);
        if (activeView) activeView.classList.add('active');

        if (viewId === 'finance') this.renderFinance();
        if (viewId === 'ai') this.renderAI();
        if (window.lucide) lucide.createIcons();
    },

    renderAll() {
        this.renderStats();
        this.renderTeachers();
        this.renderBatches();
        this.renderFinance(); // Partial Mock
        this.renderAI();
    },

    renderStats() {
        // Update Top Cards
        const totalRevenue = '$' + (State.students.length * 500).toLocaleString(); // Mock
        const activeStudents = State.students.length;

        const cardVals = document.querySelectorAll('.kpi-val');
        if (cardVals.length >= 4) {
            cardVals[0].innerText = totalRevenue;
            cardVals[1].innerText = '$MOCKED'; // Pending Fees
            cardVals[2].innerText = activeStudents;
            cardVals[3].innerText = "ONLINE"; // System Status
        }
    },

    renderTeachers() {
        const tbody = document.getElementById('teacherTableBody');
        if (!tbody) return;

        // Merge Teachers with Active Codes?
        // Codes are separate. We can list active codes in a separate table or same?
        // UI has one table. "Teacher Name... Active Code".
        // We'll try to find an unused code for the prompt "Active Code", or just list the teachers.
        // Real teachers have no "code" property in DB unless we store it.
        // We'll just show "Assigned" or finding a matching code (unlikely 1:1 map if consumed).

        tbody.innerHTML = State.teachers.map(t => {
            // Find batch risk for this teacher
            // Teacher -> Batches
            // Schema: batch has teacher_id.
            const teacherBatches = State.batches.filter(b => b.teacher_id === t.user_id); // Assuming teacher_id references user_id
            let risk = 'LOW';
            if (teacherBatches.some(b => b.status === 'LAGGING')) risk = 'HIGH';

            let riskColor = risk === 'HIGH' ? 'st-danger' : (risk === 'MED' ? 'st-warn' : 'st-ok');

            return `
                <tr>
                    <td style="font-weight:600; color:white;">${t.name}</td>
                    <td>${t.subject}</td>
                    <td><span class="status-badge ${riskColor}">${risk} RISK</span></td>
                    <td style="font-family:'JetBrains Mono'; color:var(--primary);">-</td>
                    <td><span class="status-badge st-ok">ACTIVE</span></td>
                </tr>
            `;
        }).join('');

        // Also append Active Codes as "Pending Teachers"
        const unusedCodes = State.invitationCodes.filter(c => c.role === 'teacher');
        if (unusedCodes.length > 0) {
            const codeRows = unusedCodes.map(c => `
                <tr>
                    <td style="font-weight:600; color:#aaa;">(Pending Join)</td>
                    <td>-</td>
                    <td><span class="status-badge st-warn">WAITING</span></td>
                    <td style="font-family:'JetBrains Mono'; color:var(--primary);">${c.code}</td>
                    <td><span class="status-badge st-warn">PENDING</span></td>
                </tr>
            `).join('');
            tbody.innerHTML += codeRows;
        }
    },

    renderBatches() {
        const tbody = document.getElementById('batchTableBody');
        if (!tbody) return;
        tbody.innerHTML = State.batches.map(b => {
            // Find teacher name
            const teacher = State.teachers.find(t => t.id === b.teacher_id || t.user_id === b.teacher_id)?.name || 'Unassigned';

            let progressColor = b.syllabus < 40 ? '#EF4444' : (b.syllabus < 70 ? '#F59E0B' : '#10B981');
            let statusClass = (b.status === 'CRITICAL' || b.status === 'LAGGING') ? 'st-danger' : 'st-ok';

            return `
                <tr>
                    <td style="color:white; font-weight:600;">${b.name}</td>
                    <td style="color:var(--text-muted);">${teacher}</td>
                    <td>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                            <span>${b.syllabus}% Completed</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width:${b.syllabus}%; background:${progressColor};"></div>
                        </div>
                    </td>
                    <td style="text-align:center;">${b.attendance}%</td>
                    <td style="text-align:center; font-weight:bold;">${b.score}/100</td>
                    <td><span class="status-badge ${statusClass}">${b.status}</span></td>
                </tr>
            `;
        }).join('');
    },

    renderFinance() {
        // Mocked Finance
        const feeBody = document.getElementById('feeTableBody');
        const defaulters = State.students.filter(s => s.fee_status === 'PENDING');

        if (feeBody) {
            feeBody.innerHTML = defaulters.length === 0
                ? `<tr><td colspan="4" style="text-align:center; color:#555;">No Pending Fees</td></tr>`
                : defaulters.map(s => `
                    <tr>
                        <td style="color:white;">${s.name}</td>
                        <td>-</td>
                        <td style="color:var(--danger)">$${s.fee_amount}</td>
                        <td><button class="btn-outline" style="padding:4px;" onclick="UI.showToast('Reminder Sent')">Remind</button></td>
                    </tr>
                `).join('');
        }

        const salaryBody = document.getElementById('salaryTableBody');
        if (salaryBody) {
            salaryBody.innerHTML = State.teachers.map(t => `
                 <tr>
                    <td style="color:white;">${t.name}</td>
                    <td>${t.subject}</td>
                    <td style="color:var(--warning)">$${t.salary_amount}</td>
                    <td>Due</td>
                </tr>
            `).join('');
        }
    },

    renderAI() {
        const aiCard = document.querySelector('.ai-card');
        if (!aiCard) return;

        let html = `
            <div class="ai-badge"><i data-lucide="sparkles" size="12"></i> AI INSIGHTS GENERATED</div>
            <h2 style="margin-bottom:20px;">System Analysis Report</h2>
            <div style="display:grid; gap:15px;">
        `;

        if (State.aiRisks.length === 0) {
            html += `<p style="color:#aaa;">No critical risks detected. System healthy.</p>`;
        } else {
            html += State.aiRisks.map(risk => {
                const colorVar = risk.severity === 'HIGH' ? 'var(--danger)' : (risk.severity === 'MEDIUM' ? 'var(--warning)' : 'var(--success)');
                return `
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid ${colorVar};">
                    <h4 style="color:${colorVar}; margin-bottom:5px;">${risk.severity === 'HIGH' ? '⚠️ ' : ''}${risk.title}</h4>
                    <p style="font-size:0.9rem; color:#aaa;">${risk.message}</p>
                </div>`;
            }).join('');
        }

        html += `</div>`;
        aiCard.innerHTML = html;
    },

    generateAIInsights() {
        State.aiRisks = [];
        // Real Rules
        // 1. Lagging Batches
        const lagging = State.batches.filter(b => b.status === 'LAGGING');
        if (lagging.length > 0) {
            State.aiRisks.push({
                severity: 'HIGH',
                title: 'Academic Performance Drop',
                message: `${lagging.length} batches are lagging behind. Immediate intervention required.`
            });
        }

        // 2. High Risk Teachers (if any batch score < 50)
        // ...
    }
};

// --- 2. UI HANDLERS ---
const UI = {
    openModal: () => document.getElementById('teacherModal').style.display = 'grid',
    closeModal: () => document.getElementById('teacherModal').style.display = 'none',

    showToast: window.utils.showToast
};

// --- 3. LOGIC ---
const Logic = {
    generateTeacherCode: async () => {
        const nameInput = document.getElementById('t_name');
        if (!nameInput.value) return alert("Enter a name reference");

        const code = "TEACH-" + Math.floor(1000 + Math.random() * 9000);
        const client = window.supabaseClient;

        // Insert into invitation_codes
        const { error } = await client.from('invitation_codes').insert({
            institute_id: State.institute.id,
            code: code,
            role: 'teacher'
        });

        if (error) {
            UI.showToast("Error generating code: " + error.message, 'error');
        } else {
            UI.showToast("Code Generated: " + code, 'success');
            UI.closeModal();
            // Refresh
            App.loadData(State.institute.owner_id).then(() => App.renderAll());
        }
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expose
window.App = App;
window.UI = UI;
window.Logic = Logic;
