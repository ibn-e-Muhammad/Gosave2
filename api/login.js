const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gosave-gamma.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { email, password } = req.body;

    // Validation
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

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }

    // Get user profile from our database
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

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        email_verified: false,
      });
    }

    // Return success with user data and session
    res.status(200).json({
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
