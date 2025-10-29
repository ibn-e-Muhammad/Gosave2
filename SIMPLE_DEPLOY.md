# 🚀 GoSave - Simple Vercel Deployment (5 Minutes)

## What You Need

- Your GitHub repo (✅ You have this)
- A Vercel account (free)
- Your Supabase credentials

## Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub
2. **Click "New Project"**
3. **Import your `Gosave2` repository**
4. **Leave all settings as default and click "Deploy"**

That's it! Vercel will automatically:

- Detect your React frontend
- Detect your Node.js backend
- Build and deploy everything

## Step 2: Add Environment Variables

After deployment, go to your project dashboard:

1. **Click "Settings" → "Environment Variables"**
2. **Add these variables ONE BY ONE:**

### Frontend Variables (for React):

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_API_URL = https://your-app-name.vercel.app/api
```

### Backend Variables (for Node.js API):

```
SUPABASE_URL = your_supabase_project_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
FRONTEND_URL = https://your-app-name.vercel.app
BACKEND_URL = https://your-app-name.vercel.app/api
JWT_SECRET = any_random_string_like_mysecretkey123
NODE_ENV = production
```

3. **After adding all variables, click "Redeploy"**

## Step 3: Update Supabase

1. **Go to your Supabase Dashboard**
2. **Settings → Authentication → URL Configuration**
3. **Set Site URL to:** `https://your-app-name.vercel.app`

## Step 4: Test Your App

Visit: `https://your-app-name.vercel.app`

Test these features:

- ✅ User registration
- ✅ Email verification
- ✅ Login/logout
- ✅ Admin panel

## 🎯 Your App URLs

- **Frontend:** `https://your-app-name.vercel.app`
- **Backend API:** `https://your-app-name.vercel.app/api`
- **Health Check:** `https://your-app-name.vercel.app/api/v1/health`

## 🐛 If Something Goes Wrong

1. **Check Vercel Function Logs** (in your project dashboard)
2. **Verify all environment variables are set correctly**
3. **Make sure Supabase Site URL matches your Vercel domain**

That's it! Your GoSave app is now live and ready for customer feedback! 🎉
