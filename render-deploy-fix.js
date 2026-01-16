#!/usr/bin/env node

/**
 * RENDER DEPLOYMENT FIX
 * This script runs BEFORE index.js to fix path issues
 * Usage: Set Start Command in Render to: node render-deploy-fix.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

console.log('\n🔧 RENDER DEPLOYMENT FIX SCRIPT');
console.log('================================\n');
console.log(`📍 Working Directory: ${cwd}`);
console.log(`📍 Script Location: ${__dirname}\n`);

// Check for the problematic structure
const problemPath = path.join(cwd, 'src', 'src');
const correctPath = path.join(cwd, 'src');
const authFileInProblem = path.join(problemPath, 'routes', 'auth.routes.js');
const authFileCorrect = path.join(correctPath, 'routes', 'auth.routes.js');

console.log('🔍 Checking directory structure...\n');

const problemExists = fs.existsSync(authFileInProblem);
const correctExists = fs.existsSync(authFileCorrect);

console.log(`  Checking: ${authFileCorrect}`);
console.log(`  Status: ${correctExists ? '✅ EXISTS' : '❌ NOT FOUND'}\n`);

console.log(`  Checking: ${authFileInProblem}`);
console.log(`  Status: ${problemExists ? '⚠️  DUPLICATE FOUND' : '✅ NOT FOUND'}\n`);

// If duplicate structure exists, fix it
if (problemExists) {
  console.log('⚠️  DETECTED PROBLEMATIC src/src STRUCTURE!\n');
  console.log('🔧 FIXING: Moving src/src/routes to src/routes...\n');
  
  try {
    // Move problematic routes to correct location
    if (!correctExists) {
      const problemRoutes = path.join(problemPath, 'routes');
      const correctRoutes = path.join(correctPath, 'routes');
      
      if (fs.existsSync(problemRoutes)) {
        // Copy problematic routes to correct location
        execSync(`cp -r "${problemRoutes}" "${correctRoutes}"`, { stdio: 'inherit' });
        console.log('✅ Routes moved to correct location\n');
      }
    }
    
    // Update index.js to use correct paths
    const indexPath = path.join(cwd, 'index.js');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf-8');
      
      // Replace problematic imports if they exist
      content = content.replace(/from\s+['"`].*?\/src\/src\//g, "from './");
      
      fs.writeFileSync(indexPath, content);
      console.log('✅ Fixed index.js import paths\n');
    }
  } catch (err) {
    console.error('❌ Error during fix:', err.message);
  }
}

// List current structure
console.log('📂 Current Structure:\n');
try {
  const srcFiles = fs.readdirSync(correctPath);
  srcFiles.forEach(file => {
    console.log(`  ✓ ${file}`);
  });
} catch (err) {
  console.error('  Error reading src directory:', err.message);
}

console.log('\n✅ Pre-flight checks complete!\n');
console.log('🚀 Starting Kaizaro Backend...\n');

// Now start the actual server
import('./index.js').catch(err => {
  console.error('❌ FATAL ERROR:', err);
  process.exit(1);
});
