import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 KAIZARO BACKEND STARTUP');
console.log('===========================\n');
console.log(`📍 Script Location: ${__dirname}`);
console.log(`📍 Working Directory: ${process.cwd()}\n`);

// --- 1. SMART PATH FINDER (Fixes Render/Windows path issues) ---
let srcDir = null;

// Handle Render's /src/ directory issue
let baseDir = __dirname;
if (baseDir.includes('/opt/render/project/src/backend')) {
  baseDir = '/opt/render/project';
} else if (baseDir.includes('/opt/render/project/src')) {
  baseDir = path.dirname(baseDir);
}

const searchPaths = [
  path.join(__dirname, 'src'),                    // Standard: backend/src
  path.join(baseDir, 'backend', 'src'),           // From root: backend/src
  path.join(__dirname, '..', 'backend', 'src'),   // One level up
  path.join(process.cwd(), 'backend', 'src'),     // Current working dir
  path.join(process.cwd(), 'src')                 // Direct src in cwd
];

console.log('🔍 Searching for src directory...');
console.log(`📍 __dirname: ${__dirname}`);
console.log(`📍 process.cwd(): ${process.cwd()}\n`);

for (const searchPath of searchPaths) {
  const checkFile = path.join(searchPath, 'routes', 'auth.routes.js');
  if (fs.existsSync(checkFile)) {
    srcDir = searchPath;
    console.log(`✅ FOUND src at: ${srcDir}\n`);
    break;
  }
}

// Validation
if (!srcDir) {
  console.error('❌ CRITICAL ERROR: Could not find "src" directory.');
  console.error('   Please ensure your files are in the "backend/src" folder.');
  process.exit(1);
}

// Normalize path to prevent double slashes
srcDir = path.normalize(srcDir);

// --- 2. DYNAMIC MODULE LOADER ---
async function loadModule(relativePath) {
  const fullPath = path.join(srcDir, relativePath);
  try {
    // Convert path to file:// URL for ES Import
    const fileUrl = pathToFileURL(fullPath).href;
    const mod = await import(fileUrl);
    return mod.default || mod;
  } catch (err) {
    console.error(`❌ Failed to load module: ${relativePath}`);
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }
}

// --- 3. LOAD ROUTES DYNAMICALLY ---
// Note: Hum 'let' use kar rahe hain, upar koi static import nahi hona chahiye
let authRoutes, ownerRoutes, teacherRoutes, studentRoutes;

try {
  console.log('📦 Loading Routes...');
  authRoutes = await loadModule('routes/auth.routes.js');
  ownerRoutes = await loadModule('routes/owner.routes.js');
  teacherRoutes = await loadModule('routes/teacher.routes.js');
  studentRoutes = await loadModule('routes/student.routes.js');
  console.log('✅ All routes loaded successfully.\n');
} catch (error) {
  console.error('🔥 Error loading routes:', error);
}

// --- 4. EXPRESS APP SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend Files (HTML/CSS/JS)
// HTML files are in the public directory inside backend folder
const publicPath = path.join(__dirname, 'public');
console.log(`📁 Static Files Path: ${publicPath}`);
console.log(`✅ Files served from: ${publicPath}`);
app.use(express.static(publicPath));

// --- 5. API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: "OK", platform: process.platform });
});

// --- 7. START SERVER ---
app.listen(PORT, () => {
    console.log(`\n✅ SERVER RUNNING!`);
    console.log(`👉 http://localhost:${PORT}`);
});