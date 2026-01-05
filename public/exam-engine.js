/**
 * KAIZARO EXAM ENGINE - FINAL PHYSICS (OPTIMIZED)
 * Features: Robust MCQ Rendering & Full 4-Step Carnot Cycle Simulation
 */
'use strict';

const ExamEngine = {
    sessionData: null,
    currentQIndex: 0,
    answers: {},
    timeLeft: 0,
    timerInterval: null,
    
    // Simulation Vars
    simInterval: null,
    particleInterval: null,
    simStep: 0,
    synth: window.speechSynthesis,
    particles: [],

    init() {
        const rawData = localStorage.getItem("kaizaro_active_exam");
        if (!rawData) {
            alert("No Session Data Found!");
            window.location.href = "dashboard-student.html";
            return;
        }

        this.sessionData = JSON.parse(rawData);
        document.getElementById('exam-subject').innerText = this.sessionData.subject || "Session";

        if (this.sessionData.mode === 'learning') {
            this.initLearningMode();
        } else {
            this.initExamMode();
        }
        
        if(window.lucide) lucide.createIcons();
    },

    // --- 1. LEARNING MODE (FULL CARNOT CYCLE) ---
    initLearningMode() {
        document.getElementById('exam-view').style.display = 'none';
        document.getElementById('exam-sidebar').style.display = 'none';
        document.getElementById('timer-display').style.visibility = 'hidden';
        document.getElementById('exam-buttons').style.display = 'none';
        
        document.getElementById('learning-view').style.display = 'flex';
        document.getElementById('learning-sidebar').style.display = 'flex';

        this.createParticles();
    },

    createParticles() {
        const box = document.getElementById('particle-box');
        box.innerHTML = '';
        this.particles = [];
        
        // 20 Particles for better visual
        for(let i=0; i<20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 90 + '%';
            p.style.top = Math.random() * 90 + '%';
            
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            
            this.particles.push({ el: p, x: Math.random() * 100, y: Math.random() * 100, vx, vy });
            box.appendChild(p);
        }
    },

    startSimulationLoop() {
        document.getElementById('start-sim-btn').style.display = 'none';
        
        // UI Indicators
        const vInd = document.getElementById('voice-indicator');
        vInd.style.background = '#10b981';
        vInd.style.boxShadow = '0 0 10px #10b981';
        document.getElementById('voice-status').innerText = "AI Tutor Explaining...";
        document.getElementById('voice-status').style.color = '#10b981';

        // THE 4 STEPS OF CARNOT CYCLE
        const steps = [
            {
                class: "state-iso-exp",
                label: "STEP 1: ISOTHERMAL EXPANSION (Source T1)",
                temp: "800K (Constant)",
                work: "200 J",
                text: "The engine absorbs heat from the high-temperature source (Q1). The gas expands isothermally, doing work on the piston. Internal energy remains constant.",
                speed: 3 // High Energy
            },
            {
                class: "state-adia-exp",
                label: "STEP 2: ADIABATIC EXPANSION (Cooling)",
                temp: "Dropping to 300K",
                work: "350 J",
                text: "The gas continues to expand but is now insulated. No heat enters or leaves. The expansion comes from internal energy, so the temperature drops drastically.",
                speed: 1.5 // Slowing down
            },
            {
                class: "state-iso-comp",
                label: "STEP 3: ISOTHERMAL COMPRESSION (Sink T2)",
                temp: "300K (Constant)",
                work: "-150 J",
                text: "The piston compresses the gas while in contact with the cold sink. Heat (Q2) is rejected to the sink to keep temperature constant at T2.",
                speed: 1 // Low Energy
            },
            {
                class: "state-adia-comp",
                label: "STEP 4: ADIABATIC COMPRESSION (Heating)",
                temp: "Rising to 800K",
                work: "-100 J",
                text: "Finally, the gas is compressed rapidly while insulated. No heat leaves. Work is done ON the gas, raising its temperature back to T1, completing the cycle.",
                speed: 3 // Heating up again
            }
        ];

        this.simStep = 0;
        let currentSpeed = 1;

        const runStep = () => {
            const current = steps[this.simStep];
            
            // Update CSS State
            document.getElementById('sim-container').className = "simulation-box " + current.class;
            
            // Update Text Data
            document.getElementById('temp-val').innerText = current.temp;
            document.getElementById('work-val').innerText = current.work;
            document.getElementById('step-label').innerText = current.label;
            
            // Update Note text with Fade effect
            const noteEl = document.getElementById('note-text');
            noteEl.style.opacity = 0;
            setTimeout(() => {
                noteEl.innerText = current.text;
                noteEl.style.opacity = 1;
            }, 300);
            
            currentSpeed = current.speed;
            
            // AI Voice
            this.speak(current.text);

            this.simStep = (this.simStep + 1) % steps.length;
        };

        runStep();
        // Increased time to 12s to allow reading/speaking complete paragraph
        this.simInterval = setInterval(runStep, 12000); 

        // Physics Particle Loop
        this.particleInterval = setInterval(() => {
            this.particles.forEach(p => {
                p.x += p.vx * currentSpeed;
                p.y += p.vy * currentSpeed;

                if (p.x <= 0 || p.x >= 100) p.vx *= -1;
                if (p.y <= 0 || p.y >= 100) p.vy *= -1;

                p.x = Math.max(0, Math.min(100, p.x));
                p.y = Math.max(0, Math.min(100, p.y));

                p.el.style.left = p.x + '%';
                p.el.style.top = p.y + '%';
            });
        }, 16);
    },

    speak(text) {
        if(this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower for better clarity
        this.synth.speak(utterance);
    },

    exitSession() {
        if(this.simInterval) clearInterval(this.simInterval);
        if(this.particleInterval) clearInterval(this.particleInterval);
        if(this.timerInterval) clearInterval(this.timerInterval);
        if(this.synth.speaking) this.synth.cancel();
        window.location.href = "dashboard-student.html";
    },

    // --- 2. EXAM MODE (MCQ FIX) ---
    initExamMode() {
        document.getElementById('exam-view').style.display = 'block';
        document.getElementById('exam-sidebar').style.display = 'block';
        document.getElementById('learning-view').style.display = 'none';
        document.getElementById('learning-sidebar').style.display = 'none';
        document.getElementById('timer-display').style.visibility = 'visible';
        document.getElementById('exam-buttons').style.display = 'flex';

        this.timeLeft = (this.sessionData.duration || 30) * 60;
        this.renderPalette();
        this.loadQuestion(0);
        this.startTimer();
    },

    loadQuestion(index) {
        if (!this.sessionData.questions) return;
        this.currentQIndex = index;
        const q = this.sessionData.questions[index];
        
        // Update Q Text
        document.getElementById('q-num').innerText = index + 1;
        document.getElementById('q-content').innerText = q.text;
        
        // Render Options (FIXED)
        const container = document.getElementById('options-container');
        container.innerHTML = q.options.map((opt, i) => {
            const selectedClass = this.answers[index] === i ? 'selected' : '';
            return `
                <div class="option-card ${selectedClass}" onclick="ExamEngine.selectOption(${i})">
                    <div class="option-circle"></div>
                    <div class="option-text" style="font-size:1rem; color:#e5e5e5;">${opt}</div>
                </div>
            `;
        }).join('');
        
        this.updatePalette();
    },

    selectOption(i) {
        this.answers[this.currentQIndex] = i;
        this.loadQuestion(this.currentQIndex); // Re-render to show selection
    },

    nextQuestion() {
        if (this.currentQIndex < this.sessionData.questions.length - 1) {
            this.loadQuestion(this.currentQIndex + 1);
        } else {
            if(confirm("Submit Test?")) this.submitExam();
        }
    },

    prevQuestion() {
        if (this.currentQIndex > 0) this.loadQuestion(this.currentQIndex - 1);
    },

    renderPalette() {
        document.getElementById('palette-container').innerHTML = this.sessionData.questions.map((_, i) => 
            `<div id="p-${i}" class="q-btn" onclick="ExamEngine.loadQuestion(${i})">${i+1}</div>`
        ).join('');
    },

    updatePalette() {
        this.sessionData.questions.forEach((_, i) => {
            const btn = document.getElementById(`p-${i}`);
            if(btn) {
                btn.className = 'q-btn';
                if(i === this.currentQIndex) btn.classList.add('current');
                if(this.answers[i] !== undefined) btn.classList.add('answered');
            }
        });
    },

    startTimer() {
        const display = document.getElementById('timer-display');
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
            const s = (this.timeLeft % 60).toString().padStart(2, '0');
            if(display) display.innerHTML = `<i data-lucide="clock" size="18"></i> ${m}:${s}`;
            if (this.timeLeft <= 0) this.submitExam();
        }, 1000);
    },

    submitExam() {
        clearInterval(this.timerInterval);
        
        // Score Calculation
        let score = 0;
        this.sessionData.questions.forEach((q, i) => {
            if(this.answers[i] === q.correct) score += 4;
            else if(this.answers[i] !== undefined) score -= 1;
        });

        alert(`Test Submitted!\nYour Score: ${score}`);
        this.exitSession();
    }
};

document.addEventListener('DOMContentLoaded', () => { ExamEngine.init(); });
window.ExamEngine = ExamEngine;