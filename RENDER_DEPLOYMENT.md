# Kaizaro Backend - Render Deployment Guide

## 🚀 Deployment on Render.com

### Prerequisites
- Node.js 16+ 
- Git repository configured
- Render.com account

### Important: Render Configuration

#### Step 1: Connect Repository
1. Go to https://render.com
2. Click "New +" → Select "Web Service"
3. Connect your GitHub repository: `kaizaro02yamikaze-code/kaizaro-backend`

#### Step 2: Configure Build Settings
- **Name:** kaizaro-backend
- **Environment:** Node
- **Region:** Choose closest to your users
- **Branch:** main
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Plan:** Free (or upgrade as needed)

#### Step 3: Environment Variables
Add these in Render Dashboard under "Environment":
```
PORT=3000
NODE_ENV=production
```

#### Step 4: Root Directory
**IMPORTANT:** Make sure root directory is set to `backend/` in Render settings, OR ensure the deployment is only for the backend folder.

---

## ⚠️ Troubleshooting

### Error: Cannot find module '/opt/render/project/src/src/routes/auth.routes.js'

**Solution:** This happens when the folder structure gets duplicated during deploy.

**Fix:**
1. In Render Dashboard → Service Settings
2. Set **Root Directory** to the exact folder containing `index.js`
3. Or redeploy from the `backend` branch

### Local Testing
```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

---

## 📁 Project Structure
```
backend/
├── index.js (Main Entry Point)
├── package.json
├── public/ (Frontend files)
│   ├── index.html
│   ├── index.js
│   ├── setup.html
│   ├── setup-*.html
│   └── dashboard-*.html
├── src/
│   ├── app.js
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── services/
```

---

## 🔗 Live Demo
After deployment, access at: `https://your-service-name.onrender.com`
