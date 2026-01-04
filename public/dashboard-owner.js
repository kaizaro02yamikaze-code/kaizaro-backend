/**
 * OWNER COMMAND CENTER - LOGIC KERNEL
 * Handles state, AI simulation, and UI updates.
 */

// --- 1. DATA STATE (MOCK DATABASE) ---
const State = {
    // Tracks IDs of resolved financial issues (session-based)
    resolvedFlags: new Set(), 
    aiRisks: [], // Populated by the AI Engine below

    teachers: [
        { id: 1, name: "Mr. Verma", subject: "Physics", batchRisk: "HIGH", code: "TEACH-8842", salary_status: "DUE", salary_amount: 1200 },
        { id: 2, name: "Ms. Iyer", subject: "Chemistry", batchRisk: "LOW", code: "TEACH-1042", salary_status: "PAID", salary_amount: 0 },
        { id: 3, name: "Mr. Singh", subject: "Maths", batchRisk: "MED", code: "TEACH-3321", salary_status: "DUE", salary_amount: 950 },
        { id: 4, name: "Mrs. Gupta", subject: "Biology", batchRisk: "LOW", code: "TEACH-5511", salary_status: "PAID", salary_amount: 0 }
    ],
    students: [
        { id: 101, name: "Rohan Das", batch: "JEE-A", fee_status: "PENDING", fee_amount: 1200 },
        { id: 102, name: "Amit Kumar", batch: "NEET-B", fee_status: "PENDING", fee_amount: 800 },
        { id: 103, name: "Sara Ali", batch: "JEE-A", fee_status: "PAID", fee_amount: 0 },
        { id: 104, name: "Vikram R", batch: "Foundation", fee_status: "PENDING", fee_amount: 1500 }
    ],
    batches: [
        { id: 201, name: "JEE-Alpha (Physics)", teacher: "Mr. Verma", syllabus: 45, attendance: 78, score: 62, status: "LAGGING" },
        { id: 202, name: "JEE-Alpha (Chem)", teacher: "Ms. Iyer", syllabus: 72, attendance: 95, score: 88, status: "ON TRACK" },
        { id: 203, name: "NEET-Beta (Bio)", teacher: "Mrs. Gupta", syllabus: 68, attendance: 92, score: 85, status: "ON TRACK" },
        { id: 204, name: "Foundation X (Maths)", teacher: "Mr. Singh", syllabus: 30, attendance: 65, score: 55, status: "CRITICAL" }
    ]
};

// --- 2. MAIN APP CONTROLLER ---
const App = {
    init() {
        // Initialize Icons
        if(window.lucide) lucide.createIcons();
        
        // Inject CSS Animation for Spinner
        const style = document.createElement('style');
        style.innerHTML = `
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        // Run AI Engine
        this.generateAIInsights(); 
        
        // Render All Sections
        this.renderAll();
        
        // Initial System Health Check
        this.updateSystemStatus();
    },

    navigate(viewId, btn) {
        // Sidebar active class toggle
        if(btn) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
        }
        
        // View switching
        document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
        const activeView = document.getElementById(`view-${viewId}`);
        if(activeView) activeView.classList.add('active');
        
        // Refresh specific dynamic sections
        if(viewId === 'finance') this.renderFinance();
        if(viewId === 'ai') this.renderAI();
        
        if(window.lucide) lucide.createIcons();
    },

    renderAll() {
        this.renderTeachers();
        this.renderBatches();
        this.renderFinance();
        this.renderAI();
    },

    // --- SYSTEM STATUS LOGIC (Dashboard Alert) ---
    updateSystemStatus() {
        // 1. Check Unpaid Salaries
        const salaryDues = State.teachers.filter(t => t.salary_status === 'DUE' && !State.resolvedFlags.has(`SALARY-${t.id}`));
        
        // 2. Check High Risk AI Alerts (Unacknowledged)
        const unackedRisks = State.aiRisks.filter(r => r.severity === 'HIGH' && !r.acknowledged);

        // Target Dashboard Status Badge
        // Assuming 4th card is System Status based on HTML structure
        const statusCardVal = document.querySelector('.card:nth-child(4) .kpi-val');
        
        // Alert Box Container (Top of Dashboard)
        let alertBox = document.getElementById('dashboard-alert-box');
        if(!alertBox) {
            const dashboardView = document.getElementById('view-dashboard');
            alertBox = document.createElement('div');
            alertBox.id = 'dashboard-alert-box';
            const grid = dashboardView.querySelector('.grid-4');
            if(grid) grid.parentNode.insertBefore(alertBox, grid.nextSibling);
        }

        if (salaryDues.length > 0 || unackedRisks.length > 0) {
            // ERROR STATE
            if(statusCardVal) {
                statusCardVal.innerText = "ALERT";
                statusCardVal.style.color = "var(--danger)";
            }

            alertBox.innerHTML = `
                <div class="card" style="border:1px solid var(--danger); background: var(--danger-dim); margin-top:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <i data-lucide="alert-triangle" style="color:var(--danger)"></i>
                            <div>
                                <h3 style="color:var(--danger)">Immediate Action Required</h3>
                                <p style="color:#ffadad; font-size:0.9rem;">
                                    ${salaryDues.length > 0 ? `${salaryDues.length} Salaries Pending Payment.` : `${unackedRisks.length} Critical Risks detected by AI.`}
                                </p>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="background:var(--danger); border:none;" 
                            onclick="App.navigate('${salaryDues.length > 0 ? 'finance' : 'ai'}')">
                            Resolve Now
                        </button>
                    </div>
                </div>`;
        } else {
            // OK STATE
            if(statusCardVal) {
                statusCardVal.innerText = "OK";
                statusCardVal.style.color = "var(--success)";
            }
            alertBox.innerHTML = ''; // Clear Alert
        }
        if(window.lucide) lucide.createIcons();
    },

    // --- RENDER FUNCTIONS ---

    renderTeachers() {
        const tbody = document.getElementById('teacherTableBody');
        if(!tbody) return;
        tbody.innerHTML = State.teachers.map(t => {
            let riskColor = t.batchRisk === 'HIGH' ? 'st-danger' : (t.batchRisk === 'MED' ? 'st-warn' : 'st-ok');
            return `
                <tr>
                    <td style="font-weight:600; color:white;">${t.name}</td>
                    <td>${t.subject}</td>
                    <td><span class="status-badge ${riskColor}">${t.batchRisk} RISK</span></td>
                    <td style="font-family:'JetBrains Mono'; color:var(--primary);">${t.code}</td>
                    <td><span class="status-badge st-ok">ACTIVE</span></td>
                </tr>
            `;
        }).join('');
    },

    renderBatches() {
        const tbody = document.getElementById('batchTableBody');
        if(!tbody) return;
        tbody.innerHTML = State.batches.map(b => {
            // Dynamic Progress Color
            let progressColor = b.syllabus < 40 ? '#EF4444' : (b.syllabus < 70 ? '#F59E0B' : '#10B981');
            let statusClass = (b.status === 'CRITICAL' || b.status === 'LAGGING') ? 'st-danger' : 'st-ok';
            
            return `
                <tr>
                    <td style="color:white; font-weight:600;">${b.name}</td>
                    <td style="color:var(--text-muted);">${b.teacher}</td>
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
        // 1. Fee Defaulters (With Remind Button)
        const feeBody = document.getElementById('feeTableBody');
        const defaulters = State.students.filter(s => s.fee_status === 'PENDING');
        
        if(feeBody) {
            feeBody.innerHTML = defaulters.length === 0 
                ? `<tr><td colspan="4" style="text-align:center; color:#555;">No Pending Fees</td></tr>`
                : defaulters.map(s => `
                    <tr>
                        <td style="color:white;">${s.name}</td>
                        <td>${s.batch}</td>
                        <td style="color:var(--danger)">$${s.fee_amount}</td>
                        <td>
                            <button id="btn-remind-${s.id}" class="btn-outline" style="padding:4px 8px; font-size:0.75rem;" 
                                onclick="UI.handleRemind(${s.id}, '${s.name}')">
                                <i data-lucide="bell" style="width:12px; height:12px;"></i> Remind
                            </button>
                        </td>
                    </tr>
                `).join('');
        }

        // 2. Salary Dues (With Pay Now Button)
        const salaryBody = document.getElementById('salaryTableBody');
        // Filter: Show only if DUE AND not yet resolved
        const salaryDues = State.teachers.filter(t => t.salary_status === 'DUE' && !State.resolvedFlags.has(`SALARY-${t.id}`));

        if(salaryBody) {
            salaryBody.innerHTML = salaryDues.length === 0 
                ? `<tr><td colspan="4" style="text-align:center; color:#555;">All Salaries Paid</td></tr>`
                : salaryDues.map(t => `
                    <tr>
                        <td style="color:white;">${t.name}</td>
                        <td>${t.subject}</td>
                        <td style="color:var(--warning)">$${t.salary_amount}</td>
                        <td>
                            <button class="btn btn-primary" style="padding:4px 12px; font-size:0.75rem; height:auto;"
                                onclick="UI.handlePaySalary(${t.id})">
                                Pay Now
                            </button>
                        </td>
                    </tr>
                `).join('');
        }
        
        this.updateSystemStatus(); 
    },

    renderAI() {
        const aiCard = document.querySelector('.ai-card');
        if(!aiCard) return;

        // Header Structure
        let html = `
            <div class="ai-badge"><i data-lucide="sparkles" size="12"></i> AI INSIGHTS GENERATED</div>
            <h2 style="margin-bottom:20px;">System Analysis Report</h2>
            <div style="display:grid; gap:15px;">
        `;

        // Loop through AI Risks
        html += State.aiRisks.map(risk => {
            const colorVar = risk.severity === 'HIGH' ? 'var(--danger)' : (risk.severity === 'MEDIUM' ? 'var(--warning)' : 'var(--success)');
            
            return `
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid ${colorVar}; display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h4 style="color:${colorVar}; margin-bottom:5px;">
                        ${risk.severity === 'HIGH' ? '⚠️ ' : ''}${risk.title}
                    </h4>
                    <p style="font-size:0.9rem; color:#aaa;">${risk.message}</p>
                </div>
                ${risk.severity === 'HIGH' && !risk.acknowledged ? 
                    `<button class="btn-outline" style="border-color:${colorVar}; color:${colorVar}; font-size:0.7rem; margin-left:10px; white-space:nowrap;"
                        onclick="UI.handleAcknowledgeRisk('${risk.id}')">
                        Acknowledge
                     </button>` 
                    : ''}
            </div>`;
        }).join('');

        html += `</div>`;
        aiCard.innerHTML = html;
        this.updateSystemStatus();
    },

    // --- 3. AI ENGINE (FAKE DATA GENERATOR) ---
    generateAIInsights() {
        State.aiRisks = [];

        // Logic 1: Financial Risk (High)
        const totalPending = State.students.reduce((acc, s) => acc + (s.fee_status === 'PENDING' ? s.fee_amount : 0), 0);
        if(totalPending > 2000) {
            State.aiRisks.push({
                id: 'ai-1', severity: 'HIGH', title: 'Major Cash Flow Risk',
                message: `Total outstanding fees ($${totalPending}) have crossed safety limits. Send bulk reminders immediately.`,
                acknowledged: false
            });
        }

        // Logic 2: Academic Risk (High)
        const laggingBatch = State.batches.find(b => b.status === 'CRITICAL');
        if(laggingBatch) {
            State.aiRisks.push({
                id: 'ai-2', severity: 'HIGH', title: `Dropout Warning: ${laggingBatch.name}`,
                message: `Class scores dropped below 60%. Teacher ${laggingBatch.teacher} needs immediate intervention.`,
                acknowledged: false
            });
        }

        // Logic 3: Good News (Low)
        State.aiRisks.push({
            id: 'ai-3', severity: 'LOW', title: 'Top Performance',
            message: 'Chemistry Batch B attendance is 95%+. AI suggests giving "Star Batch" status.',
            acknowledged: true
        });
        
        // Logic 4: Prediction (Medium)
        State.aiRisks.push({
            id: 'ai-4', severity: 'MEDIUM', title: 'Capacity Forecast',
            message: 'Based on current admission rate, Batch JEE-Alpha will be full in 14 days.',
            acknowledged: false
        });
    }
};

// --- 4. UI HANDLERS (INTERACTIONS) ---
const UI = {
    openModal: () => document.getElementById('teacherModal').style.display = 'grid',
    closeModal: () => document.getElementById('teacherModal').style.display = 'none',

    // Remind Button Logic
    handleRemind(studentId, studentName) {
        const btn = document.getElementById(`btn-remind-${studentId}`);
        if(!btn) return;
        
        // 1. Loading State
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Sending...`;
        btn.style.opacity = "0.7";
        if(window.lucide) lucide.createIcons();
        
        // 2. Fake Delay
        setTimeout(() => {
            // 3. Success State
            btn.innerHTML = `<i data-lucide="check"></i> Sent`;
            btn.style.borderColor = "var(--success)";
            btn.style.color = "var(--success)";
            btn.disabled = true;
            
            this.showToast(`Reminder sent to ${studentName}`);
            if(window.lucide) lucide.createIcons();
        }, 1200);
    },

    // Pay Salary Logic
    handlePaySalary(teacherId) {
        if(!confirm("Are you sure you want to transfer salary? This action is irreversible.")) return;
        
        // Mark as paid in local state
        State.resolvedFlags.add(`SALARY-${teacherId}`);
        
        this.showToast("Salary Disbursed Successfully");
        App.renderFinance(); // Table refresh
    },

    // Acknowledge AI Risk
    handleAcknowledgeRisk(riskId) {
        const risk = State.aiRisks.find(r => r.id === riskId);
        if(risk) {
            risk.acknowledged = true;
            this.showToast("Insight Acknowledged");
            App.renderAI(); // Re-render to remove button
        }
    },

    // Teacher Generation Logic
    generateTeacherCodeLogic() {
        const name = document.getElementById('t_name').value;
        const subject = document.getElementById('t_subject').value;

        if(!name || !subject) {
            alert("Please enter Name and Subject first.");
            return;
        }

        const randomCode = "TEACH-" + Math.floor(1000 + Math.random() * 9000);
        
        State.teachers.push({
            id: Date.now(),
            name: name,
            subject: subject,
            batchRisk: "LOW",
            code: randomCode,
            salary_status: "PAID",
            salary_amount: 0
        });

        alert(`Code Generated for ${name}: ${randomCode}`);
        this.closeModal();
        App.renderTeachers();
    },

    // Toast Notification System
    showToast(message) {
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', right: '20px',
                background: '#FFFFFF', color: '#000', padding: '12px 24px',
                borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: '100',
                transform: 'translateY(100px)', transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
            document.body.appendChild(toast);
        }
        
        toast.innerText = message;
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
        }, 3000);
    }
};

// Global Exposure for HTML Buttons
const Logic = {
    generateTeacherCode: UI.generateTeacherCodeLogic
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
