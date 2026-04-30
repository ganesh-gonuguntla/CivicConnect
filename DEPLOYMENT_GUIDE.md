# CivicConnect - Complete Free Tier Deployment Guide

A step-by-step guide to deploy CivicConnect on completely free services.

---

## 🎯 Overview: Free Tier Services We'll Use

| Component | Free Service | Why |
|-----------|--------------|-----|
| **Backend API** | Railway.app OR Render.com | 500 hours/month free, easy deployment |
| **Frontend** | Vercel OR Netlify | Auto-deploy from Git, unlimited bandwidth |
| **Database** | MongoDB Atlas Free | 512MB storage, great for development |
| **Image Storage** | Cloudinary Free | 25GB bandwidth, 1000 transformations/month |
| **Email Service** | Gmail SMTP | Free, reliable, easy setup |
| **Domain** | Freedomain.one OR Freenom | Free .tk/.ml/.ga domains |
| **SSL Certificate** | Built-in (Vercel/Railway/Render) | Automatic HTTPS |

---

## 📋 Prerequisites Checklist

- [ ] GitHub account (free)
- [ ] Git installed locally
- [ ] Node.js v16+ installed
- [ ] All code pushed to GitHub repository
- [ ] `.env.example` files created (without sensitive data)
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Gmail account with App Password generated
- [ ] Google OAuth credentials from Cloud Console

---

# PART 1: Backend Deployment (Railway.app - Recommended for Free Tier)

## Step 1: Prepare Backend for Deployment

### 1.1 Create `backend/.env.example`
```bash
cd backend
cat > .env.example << 'EOF'
PORT=5000
NODE_ENV=production

# Database (will be provided by MongoDB Atlas)
MONGODB_URI=your_mongodb_atlas_uri_here

# JWT Secret (generate random string)
JWT_SECRET=your_jwt_secret_here

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# OTP Expiry
OTP_EXPIRY=10

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
EOF
```

### 1.2 Update `server.js` for Production

Find this line in `backend/server.js`:
```javascript
origin: 'http://localhost:5173',
```

Replace with:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:5173',
```

Do the same for the Socket.io CORS:
```javascript
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
```

### 1.3 Update `package.json` Start Script

Ensure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 1.4 Create `Procfile` (for Railway/Heroku deployment)

In `backend` directory, create a file named `Procfile` (no extension):
```
web: node server.js
```

### 1.5 Commit and Push to GitHub

```bash
cd backend
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

---

## Step 2: Setup MongoDB Atlas (Free Tier)

### 2.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" → Create free account
3. Verify email address

### 2.2 Create Free Cluster
1. Click "Build a Database"
2. Choose **"Free"** tier (M0, 512MB storage)
3. Select cloud provider (AWS recommended)
4. Select region (closest to you)
5. Click "Create" → Wait 2-3 minutes

### 2.3 Setup Database Access
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Create username: `civicconnect`
4. Create password: `Your_Strong_Password_123`
5. Click "Add User"

### 2.4 Setup Network Access
1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm with password

### 2.5 Get Connection String
1. Go to "Databases" → Click "Connect"
2. Choose "Drivers" → Node.js
3. Copy connection string

Replace:
- `<username>` → `civicconnect`
- `<password>` → Your password from step 2.3
- Example:
```
mongodb+srv://civicconnect:Your_Strong_Password_123@cluster0.xxxxx.mongodb.net/civicconnect?retryWrites=true&w=majority
```

### 2.6 Create Database
1. Go to "Databases" → Click "Collections"
2. Click "Create Database"
3. Database name: `civicconnect`
4. Collection name: `users`
5. Click "Create"

---

## Step 3: Deploy Backend to Railway.app

### 3.1 Create Railway Account
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your repos

### 3.2 Create New Project
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select your CivicConnect repository
4. Choose `backend` as root directory
5. Click "Deploy"

### 3.3 Add Environment Variables
1. In Railway dashboard, go to your project
2. Click "Backend" service
3. Go to "Variables" tab
4. Add each variable from `.env`:

```
MONGODB_URI = mongodb+srv://civicconnect:Password@cluster0.xxxxx.mongodb.net/civicconnect?retryWrites=true&w=majority
JWT_SECRET = (generate: openssl rand -base64 32)
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = (Gmail App Password)
CLOUDINARY_CLOUD_NAME = your_name
CLOUDINARY_API_KEY = your_key
CLOUDINARY_API_SECRET = your_secret
GOOGLE_CLIENT_ID = your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your_secret
FRONTEND_URL = https://your-vercel-domain.vercel.app
OTP_EXPIRY = 10
NODE_ENV = production
PORT = 5000
```

### 3.4 Get Backend API URL
1. Go to "Deployments" tab in Railway
2. Wait for deployment to complete (green checkmark)
3. Click on your service → "Settings"
4. Find "Domains" section
5. You'll get a URL like: `https://civicconnect-backend-production.up.railway.app`

**Copy this URL - you'll need it for frontend!**

### 3.5 Test Backend
```bash
curl https://your-railway-domain.up.railway.app/
# Should return: "CivicConnect API running"
```

---

# PART 2: Frontend Deployment (Vercel - Recommended)

## Step 1: Prepare Frontend for Deployment

### 1.1 Create `frontend/.env.production`

```env
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 1.2 Update `vite.config.js`

Ensure it looks like:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      }
    }
  }
})
```

### 1.3 Commit Changes

```bash
cd frontend
git add .
git commit -m "Prepare frontend for production deployment"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "GitHub" authentication
4. Authorize Vercel

### 2.2 Import Project
1. Click "New Project"
2. Select your CivicConnect repository
3. Set **Root Directory** to `frontend`
4. Click "Configure"

### 2.3 Add Environment Variables
1. Scroll to "Environment Variables"
2. Add each variable:
   ```
   VITE_API_URL = https://your-railway-backend-url.up.railway.app/api
   VITE_GOOGLE_CLIENT_ID = your_google_client_id.apps.googleusercontent.com
   ```
3. Click "Deploy"

### 2.4 Wait for Deployment
- Vercel will build and deploy automatically
- Takes 2-5 minutes
- You'll get a URL like: `https://civicconnect.vercel.app`

**Copy this frontend URL!**

### 2.5 Update Backend FRONTEND_URL

Now that you have your Vercel domain:

1. Go back to Railway dashboard
2. Click on Backend service → Variables
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL = https://civicconnect.vercel.app
   ```
4. Railway auto-redeploys with new variables

---

# PART 3: Setup Free External Services

## Step 1: Gmail App Password (for OTP emails)

### 1.1 Enable 2FA on Gmail
1. Go to https://myaccount.google.com
2. Click "Security" (left menu)
3. Enable "2-Step Verification"

### 1.2 Generate App Password
1. Go to "App passwords" (Security section)
2. Select "Mail" → "Windows Computer"
3. Google generates 16-char password
4. Copy this password

Use in `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## Step 2: Cloudinary Free Account (for Image Uploads)

### 2.1 Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up with email

### 2.2 Get Credentials
1. Go to Dashboard
2. Find these values:
   - **Cloud Name** (top of dashboard)
   - **API Key** (under Account)
   - **API Secret** (click "Show" next to API Key)

Use in environment:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## Step 3: Google OAuth Setup (for Google Login)

### 3.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name: `CivicConnect`
4. Click "Create"

### 3.2 Enable OAuth
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External"
3. Fill form:
   - App name: `CivicConnect`
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Click "Save and Continue"

### 3.3 Create OAuth Credentials
1. Go to "Credentials" tab
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add URIs:
   - **Authorized JavaScript origins**:
     ```
     https://localhost:3000
     https://your-vercel-domain.vercel.app
     https://civicconnect.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-vercel-domain.vercel.app/callback
     https://civicconnect.vercel.app/callback
     ```
5. Click "Create"
6. Copy Client ID & Secret

Use in environment:
```
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
```

---

# PART 4: Custom Domain Setup (Optional, Free)

## Option A: Use Freedomain.one
1. Go to https://www.freedomain.one
2. Register free domain (e.g., `civicconnect.tk`)
3. Note: These domains sometimes expire or have restrictions

## Option B: Use Vercel Subdomain
- Vercel gives free subdomain: `civicconnect.vercel.app`
- No setup needed - comes with deployment

## Option C: Point Custom Domain to Vercel
If you own a domain:

### Update Vercel
1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain
4. Vercel shows DNS records to add

### Update Your Domain Registrar
1. Login to domain registrar
2. Go to DNS settings
3. Add Vercel's DNS records
4. Wait 24-48 hours for propagation

---

# PART 5: Final Configuration & Testing

## Step 1: Update All URLs

### Backend (`/server.js`)
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:5173',
```

### Frontend (`.env.production`)
```
VITE_API_URL=https://your-railway-backend.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## Step 2: Test Deployment

### 2.1 Test Backend Health Check
```bash
curl https://your-railway-backend.up.railway.app/
# Expected: "CivicConnect API running"
```

### 2.2 Test Frontend Load
1. Open https://civicconnect.vercel.app
2. Should see login page
3. Check browser console for API errors

### 2.3 Test Registration
1. Click "Register"
2. Fill form → Submit
3. Check your email for OTP
4. Enter OTP → Should complete registration

### 2.4 Test Login
1. Use registered credentials
2. Should redirect to dashboard

### 2.5 Test Google OAuth
1. Click "Login with Google"
2. Select account → Should auto-login

### 2.6 Test Issue Creation (Citizen)
1. Login as citizen
2. Click "Report Issue"
3. Fill form → Submit
4. Should see issue created

### 2.7 Test Issue Assignment (Officer)
1. Login as officer
2. Should see pending issues
3. Click assign → Should work

---

## Step 3: Monitor Deployments

### Railway Logs
```bash
# Via CLI (optional)
npm install -g @railway/cli
railway login
railway link (select project)
railway logs
```

### Vercel Logs
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments" → Click latest
4. View logs and build status

---

# PART 6: Troubleshooting

## Frontend won't load
**Problem**: Blank page or console errors
**Solution**:
```bash
# Verify API URL in Vercel env variables
# Check Network tab in DevTools
# Ensure backend is running
```

## API calls fail (CORS error)
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**:
1. Check backend `FRONTEND_URL` matches your Vercel domain
2. Restart Railway deployment (in Settings → Restart)
3. Clear browser cache (Cmd+Shift+R)

## Email not sending
**Problem**: Registration fails at OTP email step
**Solution**:
1. Verify Gmail App Password is correct (16 chars)
2. Check 2FA is enabled on Gmail
3. Test with: `node test-email.js` locally
4. Check Railway logs for email errors

## Images not uploading
**Problem**: Upload fails silently
**Solution**:
1. Verify Cloudinary credentials are correct
2. Check Cloudinary dashboard for API limits
3. Test with small image (< 5MB)
4. Check browser console for errors

## MongoDB connection fails
**Problem**: `Error: connect ECONNREFUSED`
**Solution**:
1. Verify MongoDB connection string in Railway variables
2. Check IP whitelist in MongoDB Atlas (0.0.0.0/0)
3. Test connection string locally first
4. Restart Railway deployment

## OAuth token issues
**Problem**: Google login fails
**Solution**:
1. Verify Client ID in frontend `.env.production`
2. Check authorized URIs in Google Cloud Console
3. Ensure `https://` (not http)
4. Clear browser cookies and try again

---

# PART 7: Performance & Optimization

## Railway Free Tier Limits
- ⏱️ **500 hours/month** (always enough for hobby projects)
- 📦 **Build time**: 100 builds/month free
- 🌐 **Bandwidth**: Shared, fair-use policy

## Vercel Free Tier Limits
- 🚀 **Unlimited deployments**
- 📈 **100GB bandwidth/month**
- ⚡ **Serverless functions**: 1000 invocations/day free
- 🕐 **Build minutes**: 6000/month

## MongoDB Atlas Free Tier
- 💾 **512MB storage** (usually enough for dev/testing)
- 📊 **Shared cluster**
- 🔒 **Backups included**

## Optimize Database
```javascript
// Add indexes for frequently queried fields in MongoDB
// Go to MongoDB Atlas → Collections → Indexes
```

---

# PART 8: Next Steps After Deployment

## 1. Setup Monitoring
- Railway: Enable "Railway SDK" for error tracking
- Vercel: Enable "Analytics" to track performance

## 2. Setup Automatic Backups
- MongoDB Atlas: Enable "Backup" (free option available)
- GitHub: Automatic repository backup

## 3. Monitor Logs
- Watch logs weekly for errors
- Fix bugs before they impact users

## 4. Scale When Needed
- Upgrade to Railway Paid Tier: $5/month
- Upgrade to Render.com: $7/month
- Upgrade to Vercel Pro: $20/month

## 5. Custom Domain
- Consider buying domain (~$10/year)
- Much more professional than .vercel.app

---

# PART 9: Production Checklist

Before going live:
- [ ] All 3 environment files created (.env, .env.local, .env.production)
- [ ] Sensitive data never committed to Git
- [ ] `.gitignore` includes `.env*`
- [ ] Backend CORS allows frontend domain
- [ ] Frontend API URL points to Railway backend
- [ ] MongoDB Atlas cluster online
- [ ] Network access allows 0.0.0.0/0
- [ ] Email service (Gmail) configured with App Password
- [ ] Cloudinary account credentials working
- [ ] Google OAuth URIs match deployed domains
- [ ] Both services (Railway & Vercel) deployed successfully
- [ ] All features tested (registration, login, issue creation, etc.)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate working (auto via Railway/Vercel)
- [ ] Monitoring enabled

---

# PART 10: Cost Breakdown (Annual)

| Service | Free Tier | Annual Cost |
|---------|-----------|------------|
| **Backend (Railway)** | 500 hrs/month | $0 (generous free tier) |
| **Frontend (Vercel)** | Unlimited | $0 |
| **Database (MongoDB)** | 512MB shared | $0 |
| **Email (Gmail)** | Unlimited | $0 |
| **Image Storage (Cloudinary)** | 25GB bandwidth | $0 |
| **Domain (Freenom)** | .tk/.ml/.ga | $0 |
| **Optional: Paid Domain** | - | ~$10/year |
| **TOTAL** | | **$0-10/year** |

---

# Quick Reference: Deploy in 30 Minutes

```bash
# 1. Prepare & Push Code (5 min)
cd backend
git add . && git commit -m "Deploy config" && git push

# 2. Setup MongoDB (5 min)
# - Create cluster at mongodb.com/atlas
# - Get connection string
# - Add to Railway variables

# 3. Deploy Backend (5 min)
# - Create Railway account
# - Import repo, set root to `backend`
# - Add env variables
# - Deploy!

# 4. Deploy Frontend (5 min)
# - Create Vercel account
# - Import repo, set root to `frontend`
# - Add VITE_API_URL pointing to Railway
# - Deploy!

# 5. Test (5 min)
# - Visit frontend URL
# - Test login/register
# - Done!
```

---

**You now have CivicConnect running in production completely free!** 🎉

For issues, check troubleshooting section or review deployment service documentation.
