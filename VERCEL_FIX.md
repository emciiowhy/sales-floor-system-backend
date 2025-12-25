# Fixing Vercel Production Domain Issue

## Problem
- ❌ `sales-floor-system-frontend.vercel.app` - Not working (Production domain)
- ✅ `sales-floor-system-frontend-git-main-emciiowhys-projects.vercel.app` - Working (Preview deployment)

## Solution Steps

### 1. Promote Deployment to Production

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `sales-floor-system-frontend` project
3. Go to the **Deployments** tab
4. Find the successful deployment (the one that matches the working preview URL)
5. Click the **three dots (⋯)** next to that deployment
6. Select **"Promote to Production"**

This will assign the production domain to that deployment.

### 2. Set Environment Variables

Make sure your production environment has the required environment variable:

1. Go to **Settings** → **Environment Variables**
2. Add/Verify:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.vercel.app` or your backend URL)
   - **Environment**: Production, Preview, Development (select all)

### 3. Verify Domain Configuration

1. Go to **Settings** → **Domains**
2. Verify that `sales-floor-system-frontend.vercel.app` is listed and points to Production
3. If missing, Vercel should automatically create it - but you can verify it's active

### 4. Redeploy if Needed

If the above doesn't work:

1. Go to **Deployments**
2. Click **"Redeploy"** on the latest successful deployment
3. Make sure it's deployed to **Production** environment

## Why This Happens

- **Preview deployments** (`-git-main-*.vercel.app`) are created for every commit/push
- **Production domain** (`sales-floor-system-frontend.vercel.app`) needs to be explicitly assigned to a deployment
- If no deployment is promoted to production, the production domain won't work
- The preview URL works because it's automatically linked to specific deployments

## Quick Fix Command

If you want to trigger a new production deployment:

```bash
cd frontend
# Make a small change or just commit/push
git commit --allow-empty -m "Trigger production deployment"
git push
```

Then promote that deployment to production in the Vercel dashboard.

