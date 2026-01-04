/**
 * KAIZARO EXAM ENGINE - FINAL PHYSICS
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
    particles: [], // Store particle elements

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

    // --- 1. LEARNING MODE (ANIMATION) ---
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
        
        // Generate 12 Particles
        for(let i=0; i<12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            // Random initial positions
            p.style.left = Math.random() * 90 + '%';
            p.style.top = Math.random() * 90 + '%';
            
            // Random Velocities
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            
            this.particles.push({ el: p, x: Math.random() * 100, y: Math.random() * 100, vx, vy });
            box.appendChild(p);
        }
    },

    startSimulationLoop() {
        document.getElementById('start-sim-btn').style.display = 'none';
        
        // Voice Active UI
        document.getElementById('voice-indicator').style.background = '#10b981';
        document.getElementById('voice-indicator').style.boxShadow = '0 0 10px #10b981';
        document.getElementById('voice-status').innerText = "AI Tutor Speaking...";
        document.getElementById('voice-status').style.color = '#10b981';

        const steps = [
            {
                class: "state-compression",
                label: "STEP 1: ADIABATIC COMPRESSION (High Pressure)",
                temp: "800K (Rising)",
                text: "The piston compresses the gas rapidly. Volume decreases, Pressure increases sharply. Work is done ON the gas, raising its temperature.",
                speed: 3.5 // Fast particle speed
            },
            {
                class: "state-expansion",
                label: "STEP 2: ADIABATIC EXPANSION (Work Done)",
                temp: "300K (Dropping)",
                text: "The hot gas pushes the piston up, doing work on the wheel. Pressure drops, and the gas cools down significantly.",
                speed: 0.8 // Slow particle speed
            }
        ];

        this.simStep = 0;
        let currentSpeed = 1;

        const runStep = () => {
            const current = steps[this.simStep];
            
            // Update Visuals
            document.getElementById('sim-container').className = "simulation-box " + current.class;
            document.getElementById('temp-val').innerText = current.temp;
            document.getElementById('step-label').innerText = current.label;
            document.getElementById('note-text').innerText = current.text;
            
            // Set Physics Speed
            currentSpeed = current.speed;
            
            // Speak
            this.speak(current.text);

            this.simStep = (this.simStep + 1) % steps.length;
        };

        runStep();
        this.simInterval = setInterval(runStep, 8000); // Change step every 8s

        // PHYSICS LOOP (60 FPS)
        this.particleInterval = setInterval(() => {
            this.particles.forEach(p => {
                // Update position
                p.x += p.vx * currentSpeed;
                p.y += p.vy * currentSpeed;

                // Bounce off walls
                if (p.x <= 0 || p.x >= 100) p.vx *= -1;
                if (p.y <= 0 || p.y >= 100) p.vy *= -1;

                // Keep inside
                p.x = Math.max(0, Math.min(100, p.x));
                p.y = Math.max(0, Math.min(100, p.y));

                // Apply
                p.el.style.left = p.x + '%';
                p.el.style.top = p.y + '%';
            });
        }, 16);
    },

    speak(text) {
        if(this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1; 
        this.synth.speak(utterance);
    },

    exitSession() {
        if(this.simInterval) clearInterval(this.simInterval);
        if(this.particleInterval) clearInterval(this.particleInterval);
        if(this.timerInterval) clearInterval(this.timerInterval);
        if(this.synth.speaking) this.synth.cancel();
        window.location.href = "dashboard-student.html";
    },

    // --- EXAM MODE ---
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
        document.getElementById('q-num').innerText = index + 1;
        document.getElementById('q-content').innerText = q.text;
        const container = document.getElementById('options-container');
        container.innerHTML = q.options.map((opt, i) => {
            const selected = this.answers[index] === i ? 'selected' : '';
            return `<div class="option-card ${selected}" onclick="ExamEngine.selectOption(${i})"><div class="option-circle"></div> ${opt}</div>`;
        }).join('');
        this.updatePalette();
    },

    selectOption(i) { this.answers[this.currentQIndex] = i; this.loadQuestion(this.currentQIndex); },

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
        alert("Test Submitted!");
        this.exitSession();
    }
};

document.addEventListener('DOMContentLoaded', () => { ExamEngine.init(); });
window.ExamEngine = ExamEngine;