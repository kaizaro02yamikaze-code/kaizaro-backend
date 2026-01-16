import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === FIX FOR RENDER DEPLOYMENT ===
// Detect if running in Render's problematic folder structure
let srcDir = path.join(__dirname, 'src');
const duplicateSrcPath = path.join(__dirname, 'src', 'src');

if (fs.existsSync(duplicateSrcPath)) {
  console.warn('⚠️  Detected duplicate src/src folder structure');
  srcDir = duplicateSrcPath;
}

console.log(`📂 Loading modules from: ${srcDir}`);

// Import Routes with path fallback
async function loadRoutes() {
  try {
    const auth = await import(path.join(srcDir, 'routes/auth.routes.js'));
    const owner = await import(path.join(srcDir, 'routes/owner.routes.js'));
    const teacher = await import(path.join(srcDir, 'routes/teacher.routes.js'));
    const student = await import(path.join(srcDir, 'routes/student.routes.js'));
    
    return {
      authRoutes: auth.default,
      ownerRoutes: owner.default,
      teacherRoutes: teacher.default,
      studentRoutes: student.default
    };
  } catch (err) {
    console.error('❌ Failed to load routes:', err.message);
    throw err;
  }
}

const { authRoutes, ownerRoutes, teacherRoutes, studentRoutes } = await loadRoutes();

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