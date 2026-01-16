# RENDER SETUP QUICK REFERENCE

## ⚡ 2-MINUTE RENDER SETUP

### In Render Dashboard:

1. **New Web Service** → Connect GitHub repo
2. **Service Settings:**
   ```
   Build Command:    npm install
   Start Command:    node index.js
   Root Directory:   backend          ← CRITICAL!
   ```

3. **Environment Variables:**
   - `PORT=3000`
   - `NODE_ENV=production`
   - `SUPABASE_URL=<your-value>`
   - `SUPABASE_KEY=<your-value>`
   - `Client_ID=<your-value>`
   - `Client_secret_ID=<your-value>`

4. **Deploy** → Done!

---

## ✅ WHAT'S ALREADY FIXED

| Issue | Status | File |
|-------|--------|------|
| src/src error | ✅ Fixed | index.js |
| Module imports | ✅ Fixed | index.js |
| Path normalization | ✅ Fixed | index.js |
| API routes | ✅ Working | src/routes/* |
| GitHub push | ✅ Verified | All committed |

---

## 🧪 TEST ENDPOINTS (After Render Deploy)

```bash
# Replace YOUR_RENDER_URL with your actual Render URL

curl https://YOUR_RENDER_URL/health
curl -X POST https://YOUR_RENDER_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"student"}'
curl https://YOUR_RENDER_URL/api/owner/dashboard
curl https://YOUR_RENDER_URL/api/teacher/my-classes
curl https://YOUR_RENDER_URL/api/student/profile
```

---

## 🆘 IF IT FAILS

1. Check Render logs (Dashboard → Logs)
2. Verify Root Directory is set to `backend`
3. Verify all Environment Variables are set
4. Click "Redeploy latest commit"
5. Read RENDER_SOLUTION.md for detailed troubleshooting

---

## 📌 REMEMBER

**The ONLY critical thing:** Set Root Directory to `backend` in Render Dashboard!

Everything else is already configured and tested. ✅
