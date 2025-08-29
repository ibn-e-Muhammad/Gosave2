const express = require("express");
const { supabase } = require("../../../../config/supabase");
const { verifyToken, requireAdmin } = require("../../../../middleware/auth");
const router = express.Router();

// Input validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidRole = (role) => {
  return ['viewer', 'member', 'partner', 'admin'].includes(role);
};

const isValidStatus = (status) => {
  return ['active', 'suspended'].includes(status);
};

// GET /api/v1/admin/users - List all users with pagination and filters
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      role,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        created_at,
        updated_at,
        membership_valid_until,
        memberships (
          id,
          name,
          price,
          duration_months
        )
      `, { count: 'exact' });

    // Apply filters
    if (status && isValidStatus(status)) {
      query = query.eq('status', status);
    }

    if (role && isValidRole(role)) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'email', 'full_name', 'role', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? true : false;

    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch users",
      });
    }

    // Transform data for frontend
    const transformedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      membershipPlan: user.memberships?.name || null,
      membershipPrice: user.memberships?.price || null,
      membershipValidUntil: user.membership_valid_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    res.json({
      success: true,
      data: transformedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      message: `Found ${count} users`,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/v1/admin/users/stats - Get user analytics and statistics
router.get("/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Get comprehensive user statistics
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        role,
        status,
        created_at,
        membership_id,
        memberships (
          name,
          price
        )
      `);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user statistics",
      });
    }

    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const premiumUsers = users.filter(u => u.membership_id !== null).length;
    const basicUsers = totalUsers - premiumUsers;

    // Role distribution
    const roleDistribution = {
      viewer: users.filter(u => u.role === 'viewer').length,
      member: users.filter(u => u.role === 'member').length,
      partner: users.filter(u => u.role === 'partner').length,
      admin: users.filter(u => u.role === 'admin').length,
    };

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = users.filter(u => 
      new Date(u.created_at) >= thirtyDaysAgo
    ).length;

    // Calculate monthly recurring revenue (MRR)
    const monthlyRevenue = users
      .filter(u => u.memberships && u.memberships.price)
      .reduce((total, u) => total + (u.memberships.price / (u.memberships.duration_months || 12)), 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          premiumUsers,
          basicUsers,
        },
        roleDistribution,
        growth: {
          recentRegistrations,
          growthRate: totalUsers > 0 ? ((recentRegistrations / totalUsers) * 100).toFixed(2) : 0,
        },
        revenue: {
          monthlyRevenue: monthlyRevenue.toFixed(2),
          averageRevenuePerUser: totalUsers > 0 ? (monthlyRevenue / totalUsers).toFixed(2) : 0,
        },
      },
      message: "User statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/v1/admin/users/:id - Get user details
router.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        created_at,
        updated_at,
        membership_valid_until,
        memberships (
          id,
          name,
          price,
          duration_months,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user's payment history
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        currency,
        status,
        payment_method,
        created_at,
        memberships (
          name
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Transform user data
    const transformedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      membershipPlan: user.memberships?.name || null,
      membershipPrice: user.memberships?.price || null,
      membershipDuration: user.memberships?.duration_months || null,
      membershipValidUntil: user.membership_valid_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      paymentHistory: payments || [],
    };

    res.json({
      success: true,
      data: transformedUser,
      message: "User details retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/v1/admin/users/:id - Update user profile
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name } = req.body;

    // Validation
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    if (full_name && (!full_name.trim() || full_name.length < 2)) {
      return res.status(400).json({
        success: false,
        error: "Full name must be at least 2 characters long",
      });
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (email) updateData.email = email.toLowerCase().trim();
    if (full_name) updateData.full_name = full_name.trim();

    // Check if email is already taken by another user
    if (email) {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", id)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Email address is already in use by another user",
        });
      }
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update user",
      });
    }

    console.log(`✅ Admin ${req.user.email} updated user ${updatedUser.email}`);

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        status: updatedUser.status,
        updatedAt: updatedUser.updated_at,
      },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/v1/admin/users/:id/status - Change user status (active/suspended)
router.put("/:id/status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validation
    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'active' or 'suspended'",
      });
    }

    // Get current user to check if they're trying to suspend themselves
    if (req.user.id === id && status === 'suspended') {
      return res.status(400).json({
        success: false,
        error: "You cannot suspend your own account",
      });
    }

    // Update user status
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        email,
        full_name,
        status,
        role
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({
        success: false,
        error: "User not found or update failed",
      });
    }

    const actionText = status === 'active' ? 'activated' : 'suspended';
    console.log(`✅ Admin ${req.user.email} ${actionText} user ${updatedUser.email}${reason ? ` (Reason: ${reason})` : ''}`);

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        status: updatedUser.status,
        role: updatedUser.role,
      },
      message: `User ${actionText} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/v1/admin/users/:id/role - Change user role
router.put("/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation
    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be 'viewer', 'member', 'partner', or 'admin'",
      });
    }

    // Get current user to check if they're trying to demote themselves from admin
    if (req.user.id === id && req.user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: "You cannot change your own admin role",
      });
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        email,
        full_name,
        role,
        status
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({
        success: false,
        error: "User not found or update failed",
      });
    }

    console.log(`✅ Admin ${req.user.email} changed user ${updatedUser.email} role to ${role}`);

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        status: updatedUser.status,
      },
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/v1/admin/users - Create new user (admin only)
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { email, full_name, role = 'viewer', password } = req.body;

    // Validation
    if (!email || !full_name) {
      return res.status(400).json({
        success: false,
        error: "Email and full name are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be 'viewer', 'member', 'partner', or 'admin'",
      });
    }

    if (full_name.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Full name must be at least 2 characters long",
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    // Create user in Supabase Auth (if password provided)
    let authUserId = null;
    if (password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

      if (authError) {
        console.error("Auth creation error:", authError);
        return res.status(400).json({
          success: false,
          error: authError.message || "Failed to create auth account",
        });
      }

      authUserId = authData.user.id;
    }

    // Create user record in database
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        id: authUserId, // Use auth user ID if created, otherwise let DB generate UUID
        email: email.toLowerCase(),
        full_name: full_name.trim(),
        role,
        status: 'active',
      })
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        created_at
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create user record",
      });
    }

    console.log(`✅ Admin ${req.user.email} created new user: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.created_at,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
