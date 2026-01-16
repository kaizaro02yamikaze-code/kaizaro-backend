import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === ROBUST RENDER DEPLOYMENT FIX ===
console.log('🔍 Detecting deployment environment...');
console.log(`   Current __dirname: ${__dirname}`);

let srcDir = null;
const possiblePaths = [
  // Try exact structure first
  path.join(__dirname, 'src'),
  // Try parent directory (Render might be in /src/)
  path.join(__dirname, '..', 'src'),
  // Try duplicate src/src
  path.join(__dirname, 'src', 'src'),
  // Try if we're already in src folder
  path.join(__dirname, '..', '..', 'src'),
];

// Find the correct src directory
for (const potentialPath of possiblePaths) {
  const authRoutePath = path.join(potentialPath, 'routes', 'auth.routes.js');
  if (fs.existsSync(authRoutePath)) {
    srcDir = potentialPath;
    console.log(`✅ Found src directory: ${srcDir}`);
    break;
  }
}

if (!srcDir) {
  console.error('❌ CRITICAL: Could not find src directory!');
  console.error('   Searched paths:');
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  process.exit(1);
}

// Import Routes with comprehensive error handling
async function loadRoutes() {
  const routes = {};
  const routeFiles = [
    'routes/auth.routes.js',
    'routes/owner.routes.js',
    'routes/teacher.routes.js',
    'routes/student.routes.js'
  ];

  for (const file of routeFiles) {
    const fullPath = path.join(srcDir, file);
    try {
      const module = await import(fullPath);
      const key = file.split('/')[1].replace('.routes.js', 'Routes');
      routes[key] = module.default || module;
      console.log(`  ✓ Loaded ${file}`);
    } catch (err) {
      console.error(`  ✗ Failed to load ${file}: ${err.message}`);
      throw err;
    }
  }
  return routes;
}

const routes = await loadRoutes();
const { authRoutes, ownerRoutes, teacherRoutes, studentRoutes } = routes;

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