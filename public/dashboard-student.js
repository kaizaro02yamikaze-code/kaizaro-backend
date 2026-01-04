/**
 * KAIZARO STUDENT INTELLIGENCE ENGINE (PRO)
 * -----------------------------------------
 * dashboard-student.js
 */

'use strict';

// Global variable for AI Generated Test
let generatedTestData = null;

const StudentApp = {
    // --- KNOWLEDGE BASE (Fake Data) ---
    resources: [
        {
            id: "RES-001",
            title: "Thermodynamics: Complete Chapter Notes",
            type: "note",
            subject: "Physics",
            content: `
                <h3>Chapter 12: Thermodynamics</h3>
                <p><strong>1. The Zeroth Law:</strong> If two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other.</p>
                <hr style="border-color:#333; margin:10px 0;">
                <p><strong>2. First Law (Conservation of Energy):</strong><br>
                <em style="color:#a3a3a3;">ΔQ = ΔU + ΔW</em></p>
            `
        },
        {
            id: "RES-002",
            title: "Calculus: Integration Formulas",
            type: "note",
            subject: "Math",
            content: "<h3>Integration Rules</h3><p>∫ x^n dx = (x^(n+1))/(n+1) + C</p>"
        }
    ],

    history: [
        { title: "Physics Unit 1", date: "Oct 20", score: 78, topic: "Thermodynamics" },
        { title: "Math Quiz", date: "Oct 18", score: 65, topic: "Calculus" }
    ],

    init() {
        console.log("Student OS Ready");
        this.checkForNewTests();
        this.loadHistory();
        this.loadResources();
        
        // Simulate an AI Notification on load
        setTimeout(() => {
            const chat = document.getElementById('chat-panel');
            if(chat && chat.style.display !== 'flex') {
                ChatBot.addMessage("🔔 <strong>AI Alert:</strong> I've analyzed your past 3 tests. You are losing 15% marks in <em>Kinematics</em>. Want a quick revision plan?", 'ai');
            }
        }, 2000);
    },

    // --- 1. CORE EXAM LOGIC (20 QUESTIONS / 30 MINS) ---
    startTest(id) {
        if(!confirm("Start Test (20 Questions, 30 Mins)?")) return; // Simplified confirmation

        // --- GENERATING 20 REALISTIC GENERIC MCQs ---
        const questions = [
            // PHYSICS: Thermodynamics & Mechanics
            { id: 1, text: "Which law of thermodynamics defines the concept of temperature?", options: ["Zeroth Law", "First Law", "Second Law", "Third Law"], correct: 0 },
            { id: 2, text: "In an adiabatic process, which quantity remains constant?", options: ["Temperature", "Pressure", "Heat (Q)", "Volume"], correct: 2 },
            { id: 3, text: "The efficiency of a Carnot engine is given by:", options: ["1 - T2/T1", "1 + T2/T1", "T1/T2", "1 - Q1/Q2"], correct: 0 },
            { id: 4, text: "Work done in an isochoric process is:", options: ["Maximum", "Minimum", "Zero", "Infinite"], correct: 2 },
            { id: 5, text: "Entropy of the universe is always:", options: ["Decreasing", "Constant", "Increasing", "Zero"], correct: 2 },
            { id: 6, text: "A body starts from rest with acceleration 2 m/s². Distance covered in 3s is:", options: ["9m", "18m", "6m", "3m"], correct: 0 },
            { id: 7, text: "Dimensional formula for Universal Gravitational Constant (G) is:", options: ["M-1 L3 T-2", "M L3 T-2", "M L2 T-2", "M-1 L2 T-2"], correct: 0 },
            { id: 8, text: "If momentum is increased by 20%, Kinetic Energy increases by:", options: ["44%", "20%", "40%", "10%"], correct: 0 },
            { id: 9, text: "Escape velocity from Earth is approximately:", options: ["11.2 km/s", "9.8 km/s", "11.2 m/s", "3 x 10^8 m/s"], correct: 0 },
            { id: 10, text: "Which lens is used to correct Hypermetropia?", options: ["Concave", "Convex", "Cylindrical", "Bifocal"], correct: 1 },
            
            // MATH & CHEMISTRY MIX
            { id: 11, text: "Integration of sin(x) dx is:", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correct: 1 },
            { id: 12, text: "The slope of the tangent to y = x^2 at x = 2 is:", options: ["2", "4", "8", "0"], correct: 1 },
            { id: 13, text: "Value of log(1) is:", options: ["0", "1", "Undefined", "10"], correct: 0 },
            { id: 14, text: "Which element has the highest electronegativity?", options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"], correct: 2 },
            { id: 15, text: "pH of a neutral solution at 25°C is:", options: ["0", "14", "7", "1"], correct: 2 },
            { id: 16, text: "The shape of the water (H2O) molecule is:", options: ["Linear", "Bent", "Tetrahedral", "Trigonal"], correct: 1 },
            { id: 17, text: "General formula for Alkanes is:", options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], correct: 1 },
            { id: 18, text: "Electric field inside a hollow charged conductor is:", options: ["Infinite", "Zero", "Uniform", "Variable"], correct: 1 },
            { id: 19, text: "Unit of Magnetic Flux is:", options: ["Tesla", "Weber", "Gauss", "Ampere"], correct: 1 },
            { id: 20, text: "Light appears to travel in straight lines because:", options: ["It has no mass", "It is very fast", "Wavelength is very small", "None of these"], correct: 2 }
        ];

        // Step B: Data Payload (Mode: Exam)
        const testPayload = {
            mode: "exam", // Tag telling engine this is a test
            testId: id,
            subject: "Test", // Clean title for the exam header
            duration: 30, // 30 Minutes
            questions: questions
        };

        // Step C: Save and Redirect
        localStorage.setItem("kaizaro_active_exam", JSON.stringify(testPayload));
        window.location.href = "exam-engine.html";
    },

    // --- 2. VISUAL LEARNING (Redirection Logic) ---
    playSimulation(el) {
        if(el) el.classList.add('playing');
        
        // Create a 'Learning Session' payload instead of an Exam
        const learningPayload = {
            mode: "learning", // Tag telling engine this is a Video/Sim
            title: "Interactive Simulation: Carnot Engine",
            subject: "Thermodynamics",
            videoUrl: "https://www.youtube.com/embed/s1i-dnAH9Y4?autoplay=1&mute=1", // Example Simulation Video
            questions: [] // No questions in learning mode
        };

        // Save and Redirect
        localStorage.setItem("kaizaro_active_exam", JSON.stringify(learningPayload));
        
        // Small delay to show animation
        setTimeout(() => {
            window.location.href = "exam-engine.html";
        }, 500);
    },

    // --- 3. AI GENERATOR LOGIC (Preview) ---
    generatePreview() {
        const topic = document.getElementById('t-topic').value;
        let qCount = parseInt(document.getElementById('t-qcount').value);
        const duration = document.getElementById('t-duration').value;
        const batch = document.getElementById('t-batch').value;

        if (!topic) { alert("Please enter a topic"); return; }
        if (!qCount || qCount < 1) qCount = 10;

        const btn = document.querySelector('#test-config-form button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> AI Generating...`;
        btn.disabled = true;
        if(window.lucide) lucide.createIcons();
        
        setTimeout(() => {
            const questions = [];
            for(let i=1; i<=qCount; i++) {
                questions.push({
                    id: i,
                    text: `AI Generated Q${i}: Conceptual application of ${topic} in real-world scenarios?`,
                    options: ["Theoretical Concept", "Applied Logic A", "Applied Logic B", "None"],
                    correct: 1 
                });
            }

            generatedTestData = {
                mode: "exam",
                testId: 'AI-' + Math.floor(Math.random() * 9000),
                subject: topic + " (AI Generated)",
                batch: batch || "General",
                duration: parseInt(duration),
                questions: questions
            };

            if(typeof renderPreviewModal === 'function') {
                renderPreviewModal(generatedTestData);
            } else {
                const startNow = confirm(`AI Generated ${qCount} Questions on ${topic}.\n\nStart Exam Now?`);
                if(startNow) this.startCustomExam();
            }
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            if(window.lucide) lucide.createIcons();
        }, 1500);
    },

    startCustomExam() {
        if(!generatedTestData) return;
        localStorage.setItem("kaizaro_active_exam", JSON.stringify(generatedTestData));
        window.location.href = "exam-engine.html";
    },

    // --- 4. RESOURCE & HISTORY LOGIC ---
    loadResources() {
        const list = document.querySelector('#view-resources .card');
        if(!list) return;

        list.innerHTML = this.resources.map(res => `
            <div class="list-item" style="padding:15px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="background:${res.type === 'video' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'}; padding:8px; border-radius:6px;">
                        <i data-lucide="${res.type === 'video' ? 'play-circle' : 'file-text'}" 
                           style="color:${res.type === 'video' ? '#ef4444' : '#3b82f6'}"></i>
                    </div>
                    <div>
                        <h4 style="color:white; margin-bottom:4px; font-size:0.95rem;">${res.title}</h4>
                        <span style="color:#666; font-size:0.75rem;">${res.subject}</span>
                    </div>
                </div>
                <button class="btn-outline" onclick="StudentApp.openResource('${res.id}')">
                    ${res.type === 'video' ? 'Watch' : 'Read'}
                </button>
            </div>
        `).join('');
        
        if(window.lucide) lucide.createIcons();
    },

    openResource(id) {
        const res = this.resources.find(r => r.id === id);
        if(!res) return;

        if (res.type === 'note') {
            document.getElementById('r-title').innerText = res.title;
            document.getElementById('r-score').style.display = 'none';
            document.getElementById('r-analysis').innerHTML = res.content;
            document.getElementById('r-analysis').style.textAlign = "left";
            document.getElementById('report-modal').style.display = 'grid';
        } else {
            // Treat video resources as a visual learning session
            const videoPayload = {
                mode: "learning",
                title: res.title,
                subject: res.subject,
                videoUrl: "https://www.youtube.com/embed/h1N8j7z_8Bs", // Generic physics video
                questions: []
            };
            localStorage.setItem("kaizaro_active_exam", JSON.stringify(videoPayload));
            window.location.href = "exam-engine.html";
        }
    },

    checkForNewTests() {
        const container = document.getElementById('active-tests-list');
        if (!container) return;
        
        // Simplified test card with clean "Test" title
        container.innerHTML = `
            <div style="padding:15px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center; background:rgba(59,130,246,0.1); border-radius: 8px;">
                <div>
                    <span style="color:var(--primary); font-size:0.7rem; font-weight:bold; letter-spacing: 0.5px;">TEACHER ASSIGNED</span>
                    <h4 style="color:white; margin:5px 0; font-size: 1rem;">Test</h4>
                    <span style="color:#888; font-size:0.75rem;">20 Questions • 30 Mins • High Priority</span>
                </div>
                <button class="btn-primary" style="padding: 8px 20px;" onclick="StudentApp.startTest('MOCK-FINAL')">Start Test</button>
            </div>
        `;
    },

    loadHistory() {
        const list = document.getElementById('assessments-list');
        if(!list) return;
        
        const avg = Math.round(this.history.reduce((a,b)=>a+b.score,0)/this.history.length);
        document.getElementById('disp-avg').innerText = avg + "%";
        document.getElementById('disp-count').innerText = this.history.length;

        list.innerHTML = this.history.map(h => `
            <div style="padding:15px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="color:white; margin-bottom:4px;">${h.title}</h4>
                    <span style="color:#666; font-size:0.8rem;">${h.date} • Score: ${h.score}%</span>
                </div>
                <button class="btn-outline" onclick="StudentApp.openReport('${h.title}', ${h.score})">Report</button>
            </div>
        `).join('');
    },

    openReport(title, score) {
        document.getElementById('r-title').innerText = title;
        const sEl = document.getElementById('r-score');
        sEl.style.display = 'block';
        sEl.innerText = score + "%";
        sEl.style.color = score < 70 ? 'var(--danger)' : 'var(--success)';
        
        // Simple analysis logic
        let advice = "Great performance!";
        if(score < 70) advice = "Weak areas detected: Thermodynamics & Calculus application.";
        if(score < 50) advice = "Critical: You need to watch the visual simulations before attempting next test.";

        document.getElementById('r-analysis').innerText = advice;
        document.getElementById('report-modal').style.display = 'grid';
    }
};

// --- CHATBOT ENGINE (ADAPTIVE AI) ---
const ChatBot = {
    handleInput(e) { if(e.key === 'Enter') this.sendMessage(); },
    
    sendMessage() {
        const inp = document.getElementById('chat-input');
        const txt = inp.value.trim();
        if(!txt) return;
        
        this.addMessage(txt, 'user');
        inp.value = '';
        
        const chatBody = document.getElementById('chat-body');
        const loaderId = 'load-' + Date.now();
        chatBody.innerHTML += `<div class="msg msg-ai" id="${loaderId}" style="opacity:0.7">...</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            document.getElementById(loaderId).remove();
            const reply = this.generateAIResponse(txt);
            this.addMessage(reply, 'ai');
        }, 1200);
    },

    addMessage(txt, type) {
        const body = document.getElementById('chat-body');
        body.innerHTML += `<div class="msg msg-${type}">${txt}</div>`;
        body.scrollTop = body.scrollHeight;
    },

    generateAIResponse(input) {
        const lower = input.toLowerCase();
        
        // 1. ADAPTIVE ADVICE (Based on fake test data logic)
        if(lower.includes("analysis") || lower.includes("result") || lower.includes("marks") || lower.includes("score")) {
            return "Based on your recent tests: <br>1. <strong>Strong:</strong> Calculus (85% acc). <br>2. <strong>Weak:</strong> Thermodynamics (45% acc). <br>👉 <em>Recommendation:</em> Spend 20 mins on the Carnot Engine simulation to improve your score by ~10 marks.";
        }

        // 2. STUDY PLANS
        if(lower.includes("plan") || lower.includes("study")) {
            return "Here is your adaptive plan for today: <br>• <strong>3:00 PM:</strong> 20 MCQs on Heat Transfer (High Yield).<br>• <strong>4:30 PM:</strong> Review Notes on Integration.<br>• <strong>Goal:</strong> Complete 20 generic questions in 30 mins to build speed.";
        }

        // 3. GENERIC HELP
        if(lower.includes("hello") || lower.includes("hi")) return "Hello! I've analyzed your learning graph. Shall we focus on Physics today?";
        
        return "I can help you analyze your test scores, create a study plan, or explain concepts like 'Adiabatic Process'.";
    }
};

// --- EXPORTS & LISTENERS ---
window.StudentApp = StudentApp;
window.handleEnter = (e) => ChatBot.handleInput(e);
window.sendMessage = () => ChatBot.sendMessage();

// Global wrapper for HTML buttons calling generatePreview
window.generatePreview = () => StudentApp.generatePreview();

document.addEventListener('DOMContentLoaded', () => {
    StudentApp.init();
    // Inject Spinner CSS
    const style = document.createElement('style');
    style.innerHTML = `.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
});