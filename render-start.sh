#!/bin/bash

# RENDER START SCRIPT
# This ensures correct directory detection before starting Node

echo "🔧 Render Pre-Start Diagnosis"
echo "=============================="
echo ""
echo "📍 Current Directory: $(pwd)"
echo "📍 Files in current directory:"
ls -la | head -20
echo ""
echo "🔍 Checking for src directories:"
find . -maxdepth 3 -type d -name "src" | head -10
echo ""
echo "🔍 Looking for auth.routes.js:"
find . -maxdepth 5 -name "auth.routes.js" -type f 2>/dev/null
echo ""
echo "✅ Starting server with node index.js"
echo ""
node index.js
