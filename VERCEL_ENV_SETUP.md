# 🚀 Vercel Environment Variables Setup Guide

## Required Environment Variables

Your GoSave backend needs these environment variables to connect to Supabase:

### 🔑 **SUPABASE_URL**

- **Description**: Your Supabase project URL
- **Format**: `https://your-project-id.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

### 🔑 **SUPABASE_ANON_KEY**

- **Description**: Your Supabase anonymous public key
- **Format**: Long base64 string starting with `eyJ...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API Keys → `anon` `public`

## 📋 Step-by-Step Configuration

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `gosave2` project (backend)
3. Click on the project

### Step 2: Navigate to Environment Variables

1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar

### Step 3: Add Environment Variables

For each variable, click **Add New**:

#### Variable 1: SUPABASE_URL

- **Name**: `SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co`
- **Environments**: Select all (Production, Preview, Development)

#### Variable 2: SUPABASE_ANON_KEY

- **Name**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual key)
- **Environments**: Select all (Production, Preview, Development)

### Step 4: Trigger Redeploy

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## 🧪 Testing After Configuration

Once environment variables are set and redeployed, test these endpoints:

```bash
# Health check (should work immediately)
curl https://gosave2.vercel.app/api/health

# Deals endpoint (should work after env vars are set)
curl https://gosave2.vercel.app/api/deals

# Partners endpoint (should work after env vars are set)
curl https://gosave2.vercel.app/api/partners

# Registration test (should work after env vars are set)
curl -X POST https://gosave2.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

## 🔍 How to Find Your Supabase Credentials

### Method 1: Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your GoSave project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

### Method 2: Check Local Environment

If you have them locally:

```bash
# Check your local .env file
cat gosave-backend/.env
```

### Method 3: From Frontend Environment

Your frontend might already have these values in its environment variables.

## ✅ Verification Checklist

- [ ] SUPABASE_URL is set in Vercel
- [ ] SUPABASE_ANON_KEY is set in Vercel
- [ ] Both variables are enabled for Production environment
- [ ] Project has been redeployed after adding variables
- [ ] API endpoints return data instead of "Failed to fetch" errors

## 🚨 Common Issues

**Issue**: Still getting "Failed to fetch deals" after setting variables
**Solution**: Make sure to redeploy after adding environment variables

**Issue**: Invalid Supabase credentials error
**Solution**: Double-check your SUPABASE_URL and SUPABASE_ANON_KEY values

**Issue**: CORS errors  
**Solution**: Environment variables are already configured for frontend domain

## 🎯 Expected Results

After proper configuration:

- `GET /api/deals` → Returns list of deals with partner information
- `GET /api/partners` → Returns list of approved partners
- `POST /api/register` → Creates new user accounts
- `POST /api/login` → Authenticates existing users

---

**Next Step**: After configuring environment variables, we'll test the complete frontend-to-backend integration!
