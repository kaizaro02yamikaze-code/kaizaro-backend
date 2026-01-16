import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import ownerRoutes from './src/routes/owner.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';
import studentRoutes from './src/routes/student.routes.js';

// Setup for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Agar frontend public folder me hai

// --- API ROUTES CONNECTION ---
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Serve Frontend (Dashboard)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Kaizaro Backend Running on http://localhost:${PORT}`);
    console.log(`📡 API Routes Active: /api/auth, /api/owner, etc.\n`);
});