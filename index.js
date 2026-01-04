import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Env Variables Load karein (Sabse pehle)
dotenv.config();

// 2. App Create karein (YE LINE MISSING THI)
const app = express();

// === CORRECT IMPORTS ===
import authRoutes from './src/routes/auth.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';

const PORT = process.env.PORT || 3000;

// === Global Middlewares ===
app.use(cors()); // Allow Frontend connection
app.use(express.json()); // Allow JSON data
app.use(express.static('public')); // Serve HTML/CSS files

// === API Routes Wiring ===
// 1. Auth Route (Login/Setup ke liye)
app.use('/api/v1/auth', authRoutes);

// 2. Teacher Route (AI Generation ke liye)
app.use('/api/v1/teacher', teacherRoutes);

// === Health Check ===
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 KAIZARO SERVER STARTED`);
    console.log(`👉 Live Link: http://localhost:${PORT}`);
});