const express = require("express");
const { supabase } = require("../../../config/supabase");
const { verifyToken } = require("../../../middleware/auth");
const router = express.Router();

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

// POST /api/v1/auth/register - Registration endpoint
router.post("/register", async (req, res) => {
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
        error:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
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
        error: "An account with this email already exists",
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        user_metadata: {
          full_name,
          phone: phone || null,
        },
        email_confirm: false, // Require email verification
      });

    if (authError) {
      console.error("Auth creation error:", authError);

      // Handle specific Supabase errors
      if (authError.message.includes("already registered")) {
        return res.status(409).json({
          success: false,
          error: "An account with this email already exists",
        });
      }

      return res.status(400).json({
        success: false,
        error: authError.message || "Failed to create account",
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: "Failed to create user account",
      });
    }

    // Create user record in our database
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        full_name,
        phone: phone || null,
        role: "viewer", // Default role
        status: "active",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database user creation error:", dbError);

      // If database creation fails, clean up auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create user profile",
      });
    }

    // Send verification email
    const { data: linkData, error: emailError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: email.toLowerCase(),
      });

    if (emailError) {
      console.error("Email verification error:", emailError);
      // Don't fail registration if email sending fails
    } else {
      console.log("✅ Verification email link generated successfully");
      console.log(
        "📧 Email verification link:",
        linkData?.properties?.action_link
      );

      // Development workaround: Log verification link for manual testing
      if (process.env.NODE_ENV === "development") {
        console.log("\n🔧 DEVELOPMENT WORKAROUND:");
        console.log("📋 Copy this link to verify the user manually:");
        console.log("🔗", linkData?.properties?.action_link);
        console.log("📧 User email:", email.toLowerCase());
        console.log("👤 User name:", full_name);
        console.log(
          "\n📝 Or verify manually in Supabase Dashboard > Authentication > Users"
        );
      }
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          role: dbUser.role,
          status: dbUser.status,
        },
        message:
          "Account created successfully. Please check your email to verify your account.",
        email_verification_required: true,
      },
      message:
        "Registration successful. Please verify your email to complete setup.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred during registration",
    });
  }
});

// POST /api/v1/auth/login - Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Authentication error:", authError);
      return res.status(401).json({
        success: false,
        error: authError.message || "Invalid credentials",
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }

    // Fetch user profile data from our users table using email
    // (since auth user IDs may not match database user IDs)
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        full_name,
        role,
        status,
        membership_id,
        membership_valid_until,
        memberships (
          name,
          price
        )
      `
      )
      .eq("email", authData.user.email)
      .single();

    if (profileError || !userProfile) {
      console.error("Profile fetch error:", profileError);
      console.error("Auth user email:", authData.user.email);
      console.error("Auth user ID:", authData.user.id);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
      });
    }

    // Check if user account is active
    if (userProfile.status !== "active") {
      return res.status(401).json({
        success: false,
        error: "Account is suspended",
      });
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      return res.status(401).json({
        success: false,
        error: "Please verify your email address before logging in",
        email_verification_required: true,
      });
    }

    // Prepare user data for response
    const userData = {
      id: userProfile.id,
      email: userProfile.email,
      full_name: userProfile.full_name,
      role: userProfile.role,
      status: userProfile.status,
      membership: userProfile.memberships
        ? {
            id: userProfile.membership_id,
            name: userProfile.memberships.name,
            price: userProfile.memberships.price,
            valid_until: userProfile.membership_valid_until,
          }
        : null,
    };

    res.json({
      success: true,
      data: {
        user: userData,
        session: authData.session,
        access_token: authData.session.access_token,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

// POST /api/v1/auth/logout - Logout endpoint
router.post("/logout", verifyToken, async (req, res) => {
  try {
    // Get the access token from the request
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    if (token) {
      // Sign out the user session in Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to logout",
        });
      }
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

// GET /api/v1/auth/me - Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    // User data is already attached to req.user by verifyToken middleware
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user data",
    });
  }
});

// POST /api/v1/auth/resend-verification - Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    // Check if user exists in our database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email address",
      });
    }

    // Send verification email
    const { data: linkData, error: emailError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: email.toLowerCase(),
      });

    if (emailError) {
      console.error("Email verification error:", emailError);
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email",
      });
    } else {
      console.log("✅ Resend verification email link generated successfully");
      console.log(
        "📧 Email verification link:",
        linkData?.properties?.action_link
      );
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred",
    });
  }
});

// GET /api/v1/auth/verify-email - Handle email verification callback
router.get("/verify-email", async (req, res) => {
  try {
    const { token, type } = req.query;

    if (!token || type !== "signup") {
      return res.status(400).json({
        success: false,
        error: "Invalid verification link",
      });
    }

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
    });

    if (error) {
      console.error("Email verification error:", error);
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification link",
      });
    }

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred during verification",
    });
  }
});

// POST /api/v1/auth/admin/verify-user - Admin endpoint to manually verify users (development)
router.post("/admin/verify-user", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Only allow in development mode
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        error: "Admin verification only available in development mode",
      });
    }

    // Find user in auth system
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({
        success: false,
        error: "Failed to find user",
      });
    }

    const user = users.users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.email_confirmed_at) {
      return res.status(200).json({
        success: true,
        message: "User is already verified",
        data: {
          email: user.email,
          verified_at: user.email_confirmed_at,
        },
      });
    }

    // Manually verify the user
    const { data: updateData, error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

    if (updateError) {
      console.error("Error verifying user:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to verify user",
      });
    }

    console.log(`✅ Admin verification: ${email} manually verified`);

    res.json({
      success: true,
      message: "User verified successfully",
      data: {
        email: updateData.user.email,
        verified_at: updateData.user.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred during verification",
    });
  }
});

// ============================================
// USER PROFILE & REDEMPTION ENDPOINTS (Week 4)
// ============================================

// GET /api/v1/auth/profile - Get full user profile with redemption info
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details with membership info
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        role,
        membership_expires_at,
        membership_auto_renew,
        last_redemption_at,
        created_at,
        updated_at
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
      });
    }

    // Get redemption statistics
    const { data: redemptionStats, error: statsError } = await supabase
      .from("redemptions")
      .select("id, discount_amount, redeemed_at")
      .eq("user_id", userId);

    if (statsError) {
      console.error("Stats error:", statsError);
    }

    // Calculate redemption stats
    const totalRedemptions = redemptionStats ? redemptionStats.length : 0;
    const totalSavings = redemptionStats
      ? redemptionStats.reduce(
          (sum, r) => sum + (parseFloat(r.discount_amount) || 0),
          0
        )
      : 0;

    // Check membership status
    const isValidMember =
      user.role === "member" ||
      user.role === "premium" ||
      user.role === "admin";
    const isExpired =
      user.membership_expires_at &&
      new Date(user.membership_expires_at) < new Date();

    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        membershipStatus: {
          tier: user.role,
          isActive: isValidMember && !isExpired,
          isExpired: isExpired,
          expiresAt: user.membership_expires_at,
          autoRenew: user.membership_auto_renew,
        },
        redemptionStats: {
          totalRedemptions,
          totalSavings: parseFloat(totalSavings.toFixed(2)),
          lastRedemption: user.last_redemption_at,
        },
        accountInfo: {
          memberSince: user.created_at,
          lastUpdated: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
  }
});

// GET /api/v1/auth/qr-code - Generate user QR code for redemption
router.get("/qr-code", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    // For now, we'll return the user ID and basic info that can be used for QR generation
    // In a real app, you might want to use a QR code library to generate an actual QR image
    const qrData = {
      userId: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
      // Add a simple verification hash (in production, use proper encryption)
      verification: Buffer.from(`${user.id}:${user.email}:gosave`).toString(
        "base64"
      ),
    };

    res.json({
      success: true,
      data: {
        qrData: JSON.stringify(qrData),
        displayInfo: {
          userId: user.id,
          name: user.full_name,
          membershipTier: user.role,
        },
        instructions: "Show this QR code to partner for deal redemption",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate QR code",
    });
  }
});

// POST /api/v1/auth/decode-qr - Decode and validate QR code (Partner use)
router.post("/decode-qr", verifyToken, async (req, res) => {
  try {
    const partnerUser = req.user;
    const { qrData } = req.body;

    // Verify the requester is a partner
    if (partnerUser.role !== "partner" && partnerUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only partners can decode QR codes",
      });
    }

    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: "QR data is required",
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: "Invalid QR code format",
      });
    }

    // Basic validation of QR data
    if (!parsedData.userId || !parsedData.email || !parsedData.verification) {
      return res.status(400).json({
        success: false,
        error: "Invalid QR code data",
      });
    }

    // Verify the QR code (simple verification - in production use proper encryption)
    const expectedVerification = Buffer.from(
      `${parsedData.userId}:${parsedData.email}:gosave`
    ).toString("base64");
    if (parsedData.verification !== expectedVerification) {
      return res.status(400).json({
        success: false,
        error: "QR code verification failed",
      });
    }

    // Get current user data
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        role,
        membership_expires_at,
        last_redemption_at
      `
      )
      .eq("id", parsedData.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if QR is too old (optional - 10 minutes expiry)
    const qrAge = new Date() - new Date(parsedData.timestamp);
    if (qrAge > 10 * 60 * 1000) {
      // 10 minutes in milliseconds
      return res.status(400).json({
        success: false,
        error: "QR code has expired. Please generate a new one.",
      });
    }

    // Check membership status
    const isValidMember =
      user.role === "member" ||
      user.role === "premium" ||
      user.role === "admin";
    const isExpired =
      user.membership_expires_at &&
      new Date(user.membership_expires_at) < new Date();

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        membershipTier: user.role,
        membershipExpires: user.membership_expires_at,
        isValidMember: isValidMember && !isExpired,
        isExpired: isExpired,
        lastRedemption: user.last_redemption_at,
        qrGeneratedAt: parsedData.timestamp,
      },
    });
  } catch (error) {
    console.error("Error decoding QR code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to decode QR code",
    });
  }
});

module.exports = router;
