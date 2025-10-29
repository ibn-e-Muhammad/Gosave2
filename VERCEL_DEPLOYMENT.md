# GoSave - Vercel Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites

- Vercel account (free tier available)
- GitHub repository with GoSave project
- Supabase project setup

### Step 1: Environment Variables Setup

#### Backend Environment Variables (for Vercel API routes or separate backend)

```bash
# Database & Auth
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-api.vercel.app

# Security (Optional - Vercel provides defaults)
JWT_SECRET=your_jwt_secret_key
```

#### Frontend Environment Variables

```bash
# API Configuration
VITE_API_URL=https://your-api.vercel.app
# or if using Vercel serverless functions:
# VITE_API_URL=https://your-app.vercel.app/api

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Environment
VITE_NODE_ENV=production
```

### Step 2: Vercel Configuration Files

#### For Frontend (React/Vite)

Create `vercel.json` in project root:

```json
{
  "buildCommand": "cd gosave-frontend && npm run build",
  "outputDirectory": "gosave-frontend/dist",
  "devCommand": "cd gosave-frontend && npm run dev",
  "installCommand": "cd gosave-frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-api.vercel.app/api/$1"
    }
  ]
}
```

#### For Backend (Express/Node.js)

Create separate Vercel project or use serverless functions:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "gosave-backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "gosave-backend/server.js"
    }
  ]
}
```

### Step 3: Deployment Options

#### Option A: Separate Deployments (Recommended)

1. **Frontend**: Deploy `gosave-frontend` folder to Vercel
2. **Backend**: Deploy `gosave-backend` folder to separate Vercel project
3. Update `VITE_API_URL` to point to backend URL

#### Option B: Monorepo Deployment

1. Deploy entire project with custom build commands
2. Use Vercel serverless functions for API routes

### Step 4: Deployment Steps

1. **Push to GitHub** (ensure no .env files are committed)
2. **Connect to Vercel**:
   - Go to vercel.com
   - Import GitHub repository
   - Configure build settings
3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
4. **Deploy and Test**

### Step 5: Post-Deployment Configuration

#### Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → Settings
2. Update **Site URL** to your Vercel domain
3. Add Vercel domain to **Allowed Origins**

#### Test Deployment

1. Test user registration
2. Test email verification
3. Test manual verification fallback
4. Check all API endpoints

### Security Checklist ✅

- [ ] No `.env` files in repository
- [ ] All secrets in Vercel environment variables
- [ ] Supabase RLS policies enabled
- [ ] CORS configured for production domains
- [ ] Helmet security headers enabled
- [ ] Rate limiting configured

### Common Issues & Solutions

#### CORS Issues

Update backend CORS configuration:

```javascript
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://your-app.vercel.app",
      "http://localhost:5173", // for development
    ],
    credentials: true,
  })
);
```

#### Environment Variables Not Loading

- Ensure variables are set in Vercel dashboard
- Check variable names match exactly
- Restart deployment after adding variables

#### API Routes Not Working

- Check Vercel function logs
- Verify routing configuration
- Test API endpoints directly

### Monitoring & Maintenance

#### Vercel Analytics

- Enable Vercel Analytics for performance monitoring
- Set up error tracking with Sentry (optional)

#### Supabase Monitoring

- Monitor database usage
- Check auth logs
- Review API usage

---

## 🎯 Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all required variables

# Deploy with custom configuration
vercel --prod
```

## 📞 Support

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check Supabase dashboard for auth/database issues

Your GoSave app will be live and accessible to users for feedback and testing!
