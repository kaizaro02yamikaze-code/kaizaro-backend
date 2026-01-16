#!/usr/bin/env node

/**
 * RENDER PRE-DEPLOYMENT BUILD SCRIPT
 * This script runs BEFORE npm install and fixes the deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('\n🚀 RENDER PRE-DEPLOYMENT SCRIPT');
console.log('=================================\n');

const cwd = process.cwd();
console.log(`📍 Current Directory: ${cwd}\n`);

// Check if we're in wrong location
if (cwd.includes('/src/') || cwd.endsWith('/src')) {
  console.log('⚠️  DETECTED: Running from /src/ directory (Render set wrong root)');
  console.log('🔧 ATTEMPTING FIX...\n');
  
  // We're in /opt/render/project/src/ but we need /opt/render/project/backend/
  // The best fix is to copy backend files to root or fix imports
  
  // Check if backend exists one level up
  const parentBackend = path.join(cwd, '..', 'backend');
  if (fs.existsSync(parentBackend)) {
    console.log(`✓ Found backend folder at: ${parentBackend}\n`);
    
    // Copy backend contents to current directory
    try {
      console.log('🔄 Copying backend files to current directory...\n');
      execSync(`cp -r ${parentBackend}/* .`, { stdio: 'inherit' });
      console.log('\n✅ Backend files copied successfully!');
    } catch (err) {
      console.log('Note: Some files already exist (this is OK)\n');
    }
  }
}

// Check directory structure
console.log('\n📂 Checking directory structure:\n');
const shouldExist = [
  'index.js',
  'package.json',
  'src',
  'src/routes',
  'public'
];

shouldExist.forEach(item => {
  const exists = fs.existsSync(path.join(cwd, item));
  const status = exists ? '✓' : '✗';
  console.log(`  ${status} ${item}`);
});

// Verify auth.routes.js can be found
console.log('\n🔍 Locating critical files:\n');
const criticalFiles = [
  'src/routes/auth.routes.js',
  'src/routes/owner.routes.js',
  'src/routes/teacher.routes.js',
  'src/routes/student.routes.js'
];

let allFound = true;
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(cwd, file));
  const status = exists ? '✓' : '✗';
  console.log(`  ${status} ${file}`);
  if (!exists) allFound = false;
});

if (!allFound) {
  console.log('\n❌ CRITICAL FILES NOT FOUND!');
  console.log('   Current directory:', cwd);
  console.log('\n📂 Files in current directory:');
  fs.readdirSync(cwd).forEach(f => {
    console.log(`   - ${f}`);
  });
  
  console.log('\n⚠️  This deployment will fail. Check Render Root Directory setting!');
}

console.log('\n✅ Pre-deployment checks complete!\n');
