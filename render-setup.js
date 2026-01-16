#!/usr/bin/env node

/**
 * render-setup.js - Automated Render setup detection and fix
 * Run this as: npm run render-setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔧 KAIZARO RENDER SETUP DETECTOR');
console.log('==================================\n');

// Get all directory info
const cwd = process.cwd();
console.log(`📍 Current Working Directory: ${cwd}\n`);

// Check folder structure
console.log('📁 Folder Structure:\n');

function listDir(dir, indent = '', maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return;
  
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file, idx) => {
      if (file.startsWith('.')) return; // Skip hidden files
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const isLast = idx === files.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      
      console.log(`${indent}${prefix}${file}${stats.isDirectory() ? '/' : ''}`);
      
      if (stats.isDirectory() && currentDepth < maxDepth - 1) {
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        listDir(filePath, nextIndent, maxDepth, currentDepth + 1);
      }
    });
  } catch (err) {
    console.log(`${indent}[Error reading directory]`);
  }
}

listDir(cwd);

// Find src directories
console.log('\n🔍 Searching for "src" directories:\n');

function findSrcDirs(dir, relativePath = '', results = []) {
  if (dir.includes('node_modules')) return results;
  
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file === 'src' && fs.statSync(path.join(dir, file)).isDirectory()) {
        results.push(path.join(dir, file));
      }
      
      const subDir = path.join(dir, file);
      if (fs.statSync(subDir).isDirectory() && !file.startsWith('.')) {
        findSrcDirs(subDir, path.join(relativePath, file), results);
      }
    });
  } catch (err) {
    // Ignore permission errors
  }
  
  return results;
}

const srcDirs = findSrcDirs(cwd);
srcDirs.forEach(dir => console.log(`  ✓ ${dir}`));

if (srcDirs.length === 0) {
  console.log('  ✗ No src directories found!');
}

// Check for auth.routes.js
console.log('\n🔎 Searching for auth.routes.js:\n');

let found = false;
srcDirs.forEach(srcDir => {
  const authFile = path.join(srcDir, 'routes', 'auth.routes.js');
  if (fs.existsSync(authFile)) {
    console.log(`  ✓ Found at: ${authFile}`);
    found = true;
  }
});

if (!found) {
  console.log('  ✗ auth.routes.js not found in any src directory!');
}

// Provide recommendations
console.log('\n📋 RENDER CONFIGURATION RECOMMENDATIONS:\n');

console.log('1. Go to Render Dashboard → Your Service → Settings');
console.log('2. Find "Root Directory" field');
console.log('3. Set it to: backend');
console.log('4. Click Save');
console.log('5. Click "Clear Build Cache" and "Redeploy"');

console.log('\n🎯 Build Command: npm install');
console.log('🎯 Start Command: node index.js');

console.log('\n✅ Setup detection complete!\n');
