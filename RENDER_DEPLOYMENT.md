# Kaizaro Backend - Render Deployment Guide

## 🚀 Deployment on Render.com

### Prerequisites
- Node.js 16+ 
- Git repository configured
- Render.com account

### ⚠️ CRITICAL: Fixing the src/src Error

The error `Cannot find module '/opt/render/project/src/src/routes/auth.routes.js'` happens when Render deploys incorrectly.

#### Solution: Configure Root Directory Correctly

**In Render Dashboard:**

1. Go to your Service → Settings
2. Find **"Root Directory"** field
3. Set it to: `backend`
4. Save and Redeploy

**Why?** 
- Your GitHub repo has `/backend` folder
- If you don't set Root Directory, Render treats the whole repo root as `/opt/render/project`
- This creates the `src/src` duplication

---

## 📋 Step-by-Step Render Setup

### Step 1: Connect Repository
1. Go to https://render.com
2. Click "New +" → Select "Web Service"
3. Connect GitHub: `kaizaro02yamikaze-code/kaizaro-backend`
4. Choose "main" branch

### Step 2: Configure Web Service
- **Service Name:** `kaizaro-backend`
- **Environment:** `Node`
- **Region:** (Choose closest to your users)
- **Build Command:** `npm install`
- **Start Command:** `node index.js`

### Step 3: ✅ SET ROOT DIRECTORY
- **Root Directory:** `backend` ← **THIS IS CRITICAL**
- **Plan:** Free (or upgrade as needed)

### Step 4: Environment Variables
Click "Add Environment Variable" and add:
```
PORT=3000
NODE_ENV=production
```

---

## 🔧 Testing Locally

Before deploying, verify everything works:

```bash
cd backend
npm install
npm run debug    # Check file structure
npm start        # Start server
```

Access: http://localhost:3000

---

## ✅ Auto-Fix (Already Implemented)

The latest `index.js` now has a **built-in auto-fix** that detects and handles the `src/src` problem:

```javascript
// If Render creates src/src, code automatically adjusts paths
if (fs.existsSync(duplicateSrcPath)) {
  console.warn('⚠️  Detected duplicate src/src folder structure');
  srcDir = duplicateSrcPath;
}
```

**BUT** the best practice is still to set Root Directory correctly in Render.

---

## 🐛 Troubleshooting

### Problem: Still getting src/src error after redeploy?

1. **Hard Refresh Deploy:**
   - Go to Render Dashboard
   - Click "Manual Deploy"
   - Select "Clear Build Cache"
   - Deploy

2. **Verify Settings:**
   - Root Directory: `backend` ✓
   - Build Command: `npm install` ✓
   - Start Command: `node index.js` ✓

3. **Check Logs:**
   - Click "Logs" in Render
   - Look for error messages
   - Share them if stuck

### Problem: Module still not found?

Run locally:
```bash
npm run debug
```

This will show all file paths and verify they exist.

---

## 📁 Correct Project Structure (After Fix)

When Root Directory = `backend`:
```
/opt/render/project/          ← Render root
├── index.js                   ← Main entry
├── package.json
├── src/                       ← NOT src/src/
│   ├── routes/
│   ├── config/
│   └── middleware/
└── public/
    ├── index.html
    └── setup.html
```

---

## 🎯 Deploy Commands (for Render CLI)

If using Render CLI:
```bash
render deploy --service kaizaro-backend --root backend
```

---

## 📊 Monitoring After Deploy

- **Live URL:** `https://your-service-name.onrender.com`
- **Monitor Logs:** Real-time in Render Dashboard
- **Check Health:** https://your-service-name.onrender.com/api/auth/login (should return API response)

---

## 🔐 Next Steps

After successful deployment:
1. Test login flow: `https://your-service-name.onrender.com`
2. Test API: `https://your-service-name.onrender.com/api/auth/login`
3. Connect frontend to live backend URL

