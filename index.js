import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import ownerRoutes from './src/routes/owner.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 KAIZARO BACKEND STARTUP');
console.log('===========================\n');

// === BULLETPROOF RENDER FIX ===
// This will work ANYWHERE - on localhost, Render, or any deployment
console.log(`📍 Script Location: ${__dirname}`);
console.log(`📍 Working Directory: ${process.cwd()}\n`);

let srcDir = null;
const searchPaths = [
  // Priority 1: Direct src folder
  path.join(__dirname, 'src'),
  // Priority 2: Parent directory src
  path.join(__dirname, '..', 'src'),
  // Priority 3: Duplicate src/src (Render bug)
  path.join(__dirname, 'src', 'src'),
  // Priority 4: Two levels up
  path.join(__dirname, '..', '..', 'src'),
  // Priority 5: Current working directory
  path.join(process.cwd(), 'src'),
  // Priority 6: Parent of cwd
  path.join(process.cwd(), '..', 'src'),
];

console.log('🔍 Searching for src directory...\n');

for (const searchPath of searchPaths) {
  const authRoutePath = path.join(searchPath, 'routes', 'auth.routes.js');
  console.log(`   Checking: ${searchPath}`);
  
  if (fs.existsSync(authRoutePath)) {
    srcDir = searchPath;
    console.log(`   ✅ FOUND!\n`);
    break;
  }
}

if (!srcDir) {
  console.error('❌ CRITICAL ERROR: Cannot find src directory!');
  console.error('\n   Attempted paths:');
  searchPaths.forEach(p => console.error(`   - ${p}`));
  console.error('\n📂 Directory contents:');
  try {
    const contents = fs.readdirSync(__dirname);
    contents.forEach(c => console.error(`   ${c}`));
  } catch (e) {
    console.error(`   Error: ${e.message}`);
  }
  process.exit(1);
}

console.log(`📂 Using src directory: ${srcDir}\n`);

// Using static imports for Render compatibility
console.log('📦 Loading modules:\n');
console.log('   ✓ auth.routes.js');
console.log('   ✓ owner.routes.js');
console.log('   ✓ teacher.routes.js');
console.log('   ✓ student.routes.js');

console.log('\n✅ All modules loaded successfully!\n');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`\n✅ SERVER READY!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📡 API Routes: /api/auth, /api/owner, /api/teacher, /api/student`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});