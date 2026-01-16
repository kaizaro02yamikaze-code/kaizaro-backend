#!/bin/bash
# render-fix.sh - Run this as a build command on Render

echo "🔧 Render Build Script - Kaizaro Backend"
echo "========================================="

# Check current directory structure
echo ""
echo "📁 Directory Structure:"
ls -la

echo ""
echo "📂 Checking src directory:"
if [ -d "src" ]; then
  echo "  ✓ src/ found"
  ls -la src/
else
  echo "  ✗ src/ NOT found"
  echo "  Checking parent directories..."
  cd ..
  echo "  Current dir: $(pwd)"
  ls -la
fi

echo ""
echo "🔍 Finding routes..."
find . -name "auth.routes.js" -type f 2>/dev/null | head -5

echo ""
echo "✅ Build script complete. Running npm install..."
npm install

echo ""
echo "🚀 Ready to start server!"
