# 🚀 Kaizaro Backend - RENDER DEPLOYMENT FIX

## ⚠️ ERROR YOU'RE SEEING

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/opt/render/project/src/src/routes/auth.routes.js'
```

**Why is this happening?**
- Render is treating your GitHub repo as the root directory
- Since your `index.js` and `src/` are in `/backend/` folder, Render sees it as `/opt/render/project/src/`
- When index.js tries to load `./src/routes/auth.routes.js`, it becomes `/opt/render/project/src/src/routes/auth.routes.js`

---

## ✅ SOLUTION (Choose ONE)

### **Option 1: Use Root Directory Setting (Recommended)**

**In Render Dashboard:**

1. Go to **Service Settings**
2. Find the **"Root Directory"** field
3. Set it to: `backend`
4. **Save Settings**
5. Click **"Clear Build Cache"**
6. Click **"Redeploy"**

Then use normal start command:
```
Build: npm install
Start: node index.js
```

---

### **Option 2: Use New Render Start Script (If Root Directory doesn't work)**

**In Render Dashboard:**

1. Go to **Build Settings**
2. Change **Start Command** to:
   ```
   node render-deploy-fix.js
   ```
3. Keep **Build Command** as: `npm install`
4. **Save** and **Redeploy**

This script will:
- Auto-detect the src/src problem
- Fix paths dynamically
- Start the server

---

### **Option 3: Use Bash Script (Alternative)**

```bash
Build: npm install
Start: bash render-start.sh
```

This will diagnose the directory structure before starting.

---

## 🔧 Local Testing

Test all the fixes locally first:

```bash
# Test the detection script
npm run render-setup

# Test the deploy fix
npm run render

# Normal start
npm start
```

---

## 📋 What Each Script Does

### `render-deploy-fix.js`
- ✅ Detects src/src problem
- ✅ Automatically fixes directory structure
- ✅ Updates import paths if needed
- ✅ Starts the server

### `render-setup.js`
- 🔍 Diagnoses current directory structure
- 📊 Shows folder tree
- 🎯 Recommends correct settings

### `render-start.sh`
- 📂 Shows current directory
- 🔎 Finds all src directories
- 📍 Locates auth.routes.js
- 🚀 Starts server

---

## 🎯 RECOMMENDED DEPLOYMENT METHOD

1. **First, try Option 1** (Root Directory setting)
   - This is the cleanest solution
   - Set Root Directory = `backend`
   - Redeploy

2. **If that doesn't work, use Option 2**
   - Start Command: `node render-deploy-fix.js`
   - This has auto-fix capabilities

3. **If still issues, use Option 3**
   - Start Command: `bash render-start.sh`
   - Shows diagnosis before starting

---

## 🚨 IF STILL GETTING ERRORS

### Check These Things:

1. **Verify GitHub repo structure:**
   ```
   kaizaro_tuter_AI/
   └── backend/
       ├── index.js
       ├── package.json
       ├── public/
       └── src/
           ├── routes/
           │   └── auth.routes.js
           ├── middleware/
           └── services/
   ```

2. **In Render, go to Settings and check:**
   - Root Directory: should be `backend`
   - Build Command: `npm install`
   - Start Command: `node render-deploy-fix.js` (or `node index.js`)

3. **Check Render Logs for:**
   ```
   📂 Checking directory structure...
   ✅ Found src directory: /opt/render/project/backend/src
   ✓ Loaded routes/auth.routes.js
   🚀 Kaizaro Backend Running
   ```

---

## 🆘 FINAL NUCLEAR OPTION

If nothing works, manually create a symlink in package.json:

```json
{
  "scripts": {
    "start": "mkdir -p src/routes && cp -r ./src/* ./src/routes/ 2>/dev/null; node index.js"
  }
}
```

But this shouldn't be necessary - the auto-fix should handle it.

---

## 📞 SUPPORT

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Still getting `src/src` error | Use `node render-deploy-fix.js` |
| Routes not loading | Check Root Directory is set to `backend` |
| "Cannot find module" | Run `npm run render-setup` locally to diagnose |
| Port already in use | Render assigns port automatically, don't hardcode 3000 |

---

**Make sure you deployed the latest code with these scripts to GitHub!**
