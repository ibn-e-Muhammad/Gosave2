# GoSave Backend API

Node.js/Express backend API for the GoSave platform with Supabase integration.

## 🚀 Features

- **Authentication System** with email verification
- **User Management** with role-based access
- **Partner Management** with approval workflow
- **Deal Management** with CRUD operations
- **Admin Panel APIs** with analytics
- **Supabase Integration** for database and auth

## 🛠 Tech Stack

- **Node.js** with Express framework
- **Supabase** for database and authentication
- **Vercel** for serverless deployment
- **JWT** for token management
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📁 Project Structure

```
api/                    # Vercel serverless functions
├── index.js           # Main API handler
├── health.js          # Health check endpoint
├── config/            # Configuration files
└── routes/            # API route handlers
    └── api/v1/        # Version 1 API routes
        ├── auth-enhanced.js    # Authentication routes
        ├── deals.js           # Deal management
        ├── partners.js        # Partner management
        └── analytics.js       # Analytics endpoints

gosave-backend/        # Traditional Express server (optional)
├── server.js          # Express server entry point
├── config/            # Database configuration
├── routes/            # Express route handlers
└── middleware/        # Custom middleware
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth-enhanced/register` - User registration
- `POST /api/v1/auth-enhanced/login` - User login
- `GET /api/v1/auth-enhanced/verify-email` - Email verification
- `POST /api/v1/auth-enhanced/admin-verify` - Admin verification

### Deals
- `GET /api/v1/deals` - Get all deals
- `POST /api/v1/deals` - Create new deal
- `PUT /api/v1/deals/:id` - Update deal
- `DELETE /api/v1/deals/:id` - Delete deal

### Partners
- `GET /api/v1/partners` - Get all partners
- `POST /api/v1/partners` - Partner registration
- `PUT /api/v1/partners/:id` - Update partner
- `POST /api/v1/partners/:id/approve` - Approve partner

### Admin
- `GET /api/v1/analytics` - System analytics
- `GET /api/v1/admin/users` - User management
- `PUT /api/v1/admin/users/:id` - Update user

## 🔒 Environment Variables

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## 🚀 Deployment

This backend is deployed on Vercel as serverless functions:

**Live API:** https://gosave2.vercel.app/api

**Health Check:** https://gosave2.vercel.app/api/health

## 🔗 Related

**Frontend Repository:** [GoSave-Frontend](https://github.com/ibn-e-Muhammad/GoSave-Frontend)

## 📄 License

MIT License