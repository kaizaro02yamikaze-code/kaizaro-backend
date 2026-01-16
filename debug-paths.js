#!/usr/bin/env node

/**
 * Debug script to verify folder structure on Render
 * Run this to diagnose path issues
 */

import fs from 'fs';
import path from 'path';

console.log('\n📁 Kaizaro Path Verification Debug\n');

// Get current directory
const cwd = process.cwd();
console.log(`✓ Current Working Directory: ${cwd}`);

// Check if files exist
const filesToCheck = [
  'index.js',
  'package.json',
  'src/routes/auth.routes.js',
  'src/routes/owner.routes.js',
  'src/routes/teacher.routes.js',
  'src/routes/student.routes.js',
  'public/index.html',
  'public/setup.html'
];

console.log('\n📋 Checking files:\n');

filesToCheck.forEach(file => {
  const fullPath = path.join(cwd, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${file}`);
  
  if (!exists) {
    console.log(`  → File not found at: ${fullPath}`);
  }
});

// Check for duplicate src/src path
const duplicatePath = path.join(cwd, 'src/src');
if (fs.existsSync(duplicatePath)) {
  console.log('\n⚠️  WARNING: Found duplicate "src/src" folder!');
  console.log(`   This may cause import errors.`);
}

console.log('\n✅ Debug complete!\n');
