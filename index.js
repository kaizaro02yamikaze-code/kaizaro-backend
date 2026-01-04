import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// === CORRECT IMPORTS (Naye Paths) ===
// Dhyan dein: Hum './routes/api.js' nahi, balki './src/routes/...' use kar rahe hain
import authRoutes from './src/routes/auth.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';

// Load Environment Variables
const PORT = process.env.PORT || 3000; // Ye line zaroori hai
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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
    console.log(`👉 API Ready: http://localhost:${PORT}/api/v1`);
    console.log(`👉 Dashboard: http://localhost:${PORT}/\n`);
});