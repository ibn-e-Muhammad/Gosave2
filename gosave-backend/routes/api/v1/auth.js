const express = require("express");
const { supabase } = require("../../../config/supabase");
const { verifyToken } = require("../../../middleware/auth");
const router = express.Router();

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

module.exports = router;
