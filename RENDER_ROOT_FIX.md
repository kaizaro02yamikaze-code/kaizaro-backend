# 🚨 CRITICAL: Render Configuration Fix

## Problem
```
Error: Cannot find module '/opt/render/project/src/src/routes/auth.routes.js'
```

**Root Cause:** Render is deploying from wrong root directory

- ❌ Current: `/opt/render/project/src/`
- ✅ Should be: `/opt/render/project/backend/`

---

## ✅ IMMEDIATE FIX (Do this RIGHT NOW)

### In Render Dashboard:

1. **Go to:** Your Service → Settings
2. **Find:** Root Directory field
3. **IMPORTANT:** Leave it BLANK (or explicitly set to `backend/`)
4. **Build Command:**
   ```
   npm install
   ```
5. **Start Command:**
   ```
   node index.js
   ```

### If Root Directory field doesn't exist:

1. Go to **Environment** tab
2. Look for **Build Settings** section
3. Add environment variable:
   ```
   ROOT_DIRECTORY=backend
   ```

---

## 🔧 How to Check if Fixed:

After updating settings, Render should show in logs:

```
==> Checking out commit [...] in branch main
==> Running build command 'npm install'...
added 169 packages
==> Deploying...
==> Running 'node index.js'

🚀 KAIZARO BACKEND STARTUP
===========================
📍 Script Location: /opt/render/project/backend
🔍 Searching for src directory...
   Checking: /opt/render/project/backend/src
   ✅ FOUND!
✅ All modules loaded successfully!
✅ SERVER READY!
```

---

## 🎯 Why This Matters

Your GitHub repo structure:
```
kaizaro_tuter_AI/
├── backend/           ← Render must use this as root
│   ├── index.js
│   ├── package.json
│   └── src/
│       └── routes/
│           └── auth.routes.js
```

If Render deploys from repo root, it sees:
```
/opt/render/project/backend/src   <- This is /src/ in Render
```

So when looking for `./src/routes/auth.routes.js` it becomes:
```
/opt/render/project/backend/src/src/routes/auth.routes.js   ❌ WRONG!
```

Setting Root Directory = `backend` fixes this:
```
/opt/render/project/backend/src/routes/auth.routes.js   ✅ CORRECT!
```

---

## 📝 Exact Steps:

### Option A: Using Root Directory (EASIEST)
1. Dashboard → Service Settings
2. Root Directory: `backend`
3. Build: `npm install`
4. Start: `node index.js`
5. Save → Clear Build Cache → Redeploy

### Option B: Using Environment Variable
1. Dashboard → Environment
2. Add Variable: `ROOT_DIRECTORY` = `backend`
3. Same build/start commands
4. Save → Redeploy

### Option C: Manual Fix via URL
If you have direct service URL, update it with query params:
```
https://render.com/services/[service-id]/settings
```
Edit and set Root Directory explicitly.

---

## 🆘 If Still Failing

Check Render Logs for:
- `npm install` success ✓
- Pre-build script runs ✓
- `node index.js` starts ✓

If logs show `/opt/render/project/src/` still, then Root Directory setting was NOT applied.

**Try:**
1. Clear all browser cache
2. Go to Settings directly (not via overview)
3. Scroll to find "Root Directory"
4. Save changes
5. In Logs section, click "Manual Deploy"
6. Check logs again

---

## 🚀 After Fix Works

Your server will start successfully:
```
✅ SERVER READY!
🌐 URL: https://your-service.onrender.com
📡 API Routes: /api/auth, /api/owner, /api/teacher, /api/student
🏥 Health Check: https://your-service.onrender.com/health
```

Test with:
```bash
curl https://your-service.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T...",
  "environment": "production"
}
```

---

**APPLY THIS FIX NOW AND REDEPLOY!** 🚀
