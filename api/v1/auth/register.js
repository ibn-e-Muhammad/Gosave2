const { createClient } = require('@supabase/supabase-js');

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
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://gosave-gamma.vercel.app");
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
      error: "Method not allowed"
    });
  }

  try {
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
        error: "Password must be at least 8 characters with uppercase, lowercase, and number",
      });
    }

    // Check if user already exists in our database
    const { data: existingUser, error: checkError } = await supabase
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
      console.error("Supabase auth error:", authError);
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: "Failed to create user account",
      });
    }

    // Create user profile in our users table
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
      console.error("Database error:", userError);
      // If user creation in our table fails, we should delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        success: false,
        error: "Failed to create user profile",
      });
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        membership_status: userData.membership_status,
        email_verified: false,
      },
      // Note: We don't return session/tokens for unverified users
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};