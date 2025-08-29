const { supabase } = require("../config/supabase");

// Middleware to verify JWT tokens using Supabase's built-in verification
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    // Use Supabase's built-in JWT verification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Supabase auth verification failed:", authError?.message);
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    console.log("JWT verification successful. User:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    try {
      // Fetch user data from database using email from auth user
      const userEmail = user.email;

      if (!userEmail) {
        console.error("No email found in auth user");
        return res.status(401).json({
          success: false,
          error: "Invalid token - no email",
        });
      }

      const { data: dbUser, error: userError } = await supabase
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
        .eq("email", userEmail)
        .single();

      if (userError || !dbUser) {
        console.error("User fetch error:", userError);
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      // Check if user is active
      if (dbUser.status !== "active") {
        return res.status(401).json({
          success: false,
          error: "Account suspended",
        });
      }

      // Attach user data to request
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
        status: dbUser.status,
        membership: dbUser.memberships
          ? {
              id: dbUser.membership_id,
              name: dbUser.memberships.name,
              price: dbUser.memberships.price,
              valid_until: dbUser.membership_valid_until,
            }
          : null,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Authentication failed",
      });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(["admin"]);

// Middleware to check if user is member or admin
const requireMember = requireRole(["member", "admin"]);

// Middleware to check if user has valid membership
const requireValidMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (req.user.role === "admin") {
    return next(); // Admins bypass membership checks
  }

  if (!req.user.membership) {
    return res.status(403).json({
      success: false,
      error: "Active membership required",
    });
  }

  // Check if membership is still valid
  const today = new Date().toISOString().split("T")[0];
  if (req.user.membership.valid_until < today) {
    return res.status(403).json({
      success: false,
      error: "Membership expired",
    });
  }

  next();
};

// Middleware to check if user has premium membership
const requirePremiumMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (req.user.role === "admin") {
    return next(); // Admins bypass membership checks
  }

  if (!req.user.membership || req.user.membership.name !== "premium") {
    return res.status(403).json({
      success: false,
      error: "Premium membership required",
    });
  }

  // Check if membership is still valid
  const today = new Date().toISOString().split("T")[0];
  if (req.user.membership.valid_until < today) {
    return res.status(403).json({
      success: false,
      error: "Membership expired",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireMember,
  requireValidMembership,
  requirePremiumMembership,
};
