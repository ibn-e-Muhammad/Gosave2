const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Set CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gosave-gamma.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

// Main API handler
module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = req.url;
  const method = req.method;

  try {
    // API Root endpoint
    if (url === "/api" || url === "/api/") {
      return res.status(200).json({
        message: "🎉 GoSave API is running on Vercel!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        version: "1.0.0",
        status: "healthy",
        endpoints: {
          health: "/api/health",
          register: "/api/register",
          login: "/api/login",
          deals: "/api/deals",
          partners: "/api/partners",
        },
        cors: {
          origin: "https://gosave-gamma.vercel.app",
          credentials: true,
        },
      });
    }

    // Health check endpoint
    if (url === "/api/health") {
      return res.status(200).json({
        message: "GoSave API Health Check - OK!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    }

    // Supabase connection test endpoint
    if (url === "/api/test-db") {
      try {
        // Simple query to test connection - just get one user
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .limit(1);

        if (error) {
          return res.status(500).json({
            success: false,
            error: "Database connection failed",
            details: error,
            env_check: {
              has_url: !!process.env.SUPABASE_URL,
              has_key: !!process.env.SUPABASE_ANON_KEY,
              url_preview: process.env.SUPABASE_URL
                ? process.env.SUPABASE_URL.substring(0, 30) + "..."
                : "NOT_SET",
            },
          });
        }

        return res.status(200).json({
          success: true,
          message: "Database connection successful",
          result_count: data ? data.length : 0,
          env_check: {
            has_url: !!process.env.SUPABASE_URL,
            has_key: !!process.env.SUPABASE_ANON_KEY,
            url_preview: process.env.SUPABASE_URL
              ? process.env.SUPABASE_URL.substring(0, 30) + "..."
              : "NOT_SET",
          },
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: "Database test failed",
          details: err.message,
        });
      }
    }

    // User Registration endpoint
    if (url === "/api/register" && method === "POST") {
      const { email, password, full_name, phone } = req.body;

      // Validation
      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          error: "Email, password, and full name are required",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address",
        });
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({
          success: false,
          error:
            "Password must be at least 8 characters with uppercase, lowercase, and number",
        });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: full_name,
            phone: phone || null,
          },
        },
      });

      if (authError) {
        return res.status(400).json({
          success: false,
          error: authError.message,
        });
      }

      // Create user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            auth_user_id: authData.user.id,
            email: email.toLowerCase(),
            full_name: full_name,
            phone: phone || null,
            membership_status: "free",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (userError) {
        // Cleanup auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({
          success: false,
          error: "Failed to create user profile",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          membership_status: userData.membership_status,
          email_verified: false,
        },
      });
    }

    // User Login endpoint
    if (url === "/api/login" && method === "POST") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError || !userProfile) {
        return res.status(404).json({
          success: false,
          error: "User profile not found",
        });
      }

      // Check email verification
      if (!data.user.email_confirmed_at) {
        return res.status(403).json({
          success: false,
          error: "Please verify your email before logging in",
          email_verified: false,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: userProfile.id,
          auth_user_id: userProfile.auth_user_id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          phone: userProfile.phone,
          membership_status: userProfile.membership_status,
          is_admin: userProfile.is_admin,
          email_verified: !!data.user.email_confirmed_at,
        },
        session: data.session,
      });
    }

    // Get Deals endpoint
    if (url === "/api/deals" && method === "GET") {
      const { data: deals, error } = await supabase
        .from("deals")
        .select(
          `
          *,
          partners (
            id,
            brand_name,
            logo_url,
            business_type
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase deals error:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch deals",
          debug: error.message,
          details: error,
        });
      }

      const transformedDeals = deals.map((deal) => ({
        id: deal.id,
        title: deal.deal_title,
        description: deal.description,
        discount_percentage: deal.min_discount, // using min_discount as percentage
        original_price: null, // not in schema
        discounted_price: null, // not in schema
        category: deal.partner?.business_type,
        status: 'active', // filtered by active status
        expiry_date: deal.end_date,
        terms_conditions: null, // not in schema
        usage_limit: null, // not in schema
        used_count: null, // not in schema
        created_at: deal.created_at,
        partner: deal.partners
          ? {
              id: deal.partners.id,
              brand_name: deal.partners.brand_name,
              logo_url: deal.partners.logo_url,
              business_type: deal.partners.business_type,
            }
          : null,
      }));

      return res.status(200).json({
        success: true,
        deals: transformedDeals,
        count: transformedDeals.length,
      });
    }

    // Get Partners endpoint
    if (url === "/api/partners" && method === "GET") {
      const { data: partners, error } = await supabase
        .from("partners")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase partners error:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch partners",
          debug: error.message,
          details: error,
        });
      }

      return res.status(200).json({
        success: true,
        partners: partners || [],
        count: partners?.length || 0,
      });
    }

    // Default 404 response
    return res.status(404).json({
      error: "API endpoint not found",
      path: req.url,
      method: req.method,
      message: "Please check the available endpoints at /api",
      available_endpoints: [
        "GET /api - API documentation",
        "GET /api/health - Health check",
        "POST /api/register - User registration",
        "POST /api/login - User login",
        "GET /api/deals - Get all deals",
        "GET /api/partners - Get all partners",
      ],
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
};
