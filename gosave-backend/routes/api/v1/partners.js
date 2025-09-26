const express = require("express");
const { supabase } = require("../../../config/supabase");
const { verifyToken, requireAdmin } = require("../../../middleware/auth");
const router = express.Router();

// GET /api/v1/partners - Get all partners
router.get("/", async (req, res) => {
  try {
    // Query partners from database
    const { data: partners, error } = await supabase
      .from("partners")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch partners",
      });
    }

    // Transform data to match frontend expectations
    const transformedPartners = partners.map((partner) => ({
      id: partner.id,
      brandName: partner.brand_name,
      ownerName: partner.owner_name,
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      businessType: partner.business_type,
      address: partner.address,
      city: partner.city,
      discountRange: `${partner.min_discount}-${partner.max_discount}%`,
      status: partner.status,
      contractDuration: partner.contract_duration_months,
    }));

    res.json({
      success: true,
      data: transformedPartners,
      count: transformedPartners.length,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch partners",
    });
  }
});

// GET /api/v1/partners/all - Get all partners (admin only)
router.get("/all", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Query all partners regardless of status
    const { data: partners, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch all partners",
      });
    }

    // Transform data
    const transformedPartners = partners.map((partner) => ({
      id: partner.id,
      brandName: partner.brand_name,
      ownerName: partner.owner_name,
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      businessType: partner.business_type,
      address: partner.address,
      city: partner.city,
      discountRange: `${partner.min_discount}-${partner.max_discount}%`,
      status: partner.status,
      contractDuration: partner.contract_duration_months,
      createdAt: partner.created_at,
      updatedAt: partner.updated_at,
    }));

    res.json({
      success: true,
      data: transformedPartners,
      count: transformedPartners.length,
      message: "All partners (admin view)",
    });
  } catch (error) {
    console.error("Error fetching all partners:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch all partners",
    });
  }
});

// GET /api/v1/partners/pending - Get pending partners (admin only)
router.get("/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Query pending partners
    const { data: partners, error } = await supabase
      .from("partners")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch pending partners",
      });
    }

    // Transform data
    const transformedPartners = partners.map((partner) => ({
      id: partner.id,
      brandName: partner.brand_name,
      ownerName: partner.owner_name,
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      businessType: partner.business_type,
      address: partner.address,
      city: partner.city,
      discountRange: `${partner.min_discount}-${partner.max_discount}%`,
      status: partner.status,
      contractDuration: partner.contract_duration_months,
      createdAt: partner.created_at,
    }));

    res.json({
      success: true,
      data: transformedPartners,
      count: transformedPartners.length,
      message: "Pending partners awaiting approval",
    });
  } catch (error) {
    console.error("Error fetching pending partners:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending partners",
    });
  }
});

// GET /api/v1/partners/available-deals - Get available deals for partner
router.get("/available-deals", verifyToken, async (req, res) => {
  try {
    const partnerUser = req.user;
    console.log("🔍 Available deals request from user:", partnerUser);

    // Verify the requester is a partner
    if (partnerUser.role !== "partner" && partnerUser.role !== "admin") {
      console.log("❌ User role check failed:", partnerUser.role);
      return res.status(403).json({
        success: false,
        error: "Only partners can access this endpoint",
      });
    }

    // Get partner details
    const { data: partnerData, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", partnerUser.id)
      .single();

    console.log("🏪 Partner lookup result:", { partnerData, partnerError });

    if (partnerError || !partnerData) {
      console.log("❌ Partner profile not found for user:", partnerUser.id);
      return res.status(403).json({
        success: false,
        error: "Partner profile not found",
      });
    }

    // Get active deals for this partner
    const { data: deals, error } = await supabase
      .from("deals")
      .select(
        `
        id,
        deal_title,
        description,
        start_date,
        end_date,
        min_discount,
        max_discount,
        membership_tier,
        max_redemptions,
        total_redemptions,
        redemption_limit_per_user,
        redemption_period,
        status,
        location,
        city
      `
      )
      .eq("partner_id", partnerData.id)
      .eq("status", "active")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false });

    console.log("📋 Deals query result:", {
      deals,
      error,
      partnerId: partnerData.id,
    });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch available deals",
      });
    }

    // Transform deals data with redemption info
    const transformedDeals = deals.map((deal) => ({
      id: deal.id,
      title: deal.deal_title,
      description: deal.description,
      startDate: deal.start_date,
      endDate: deal.end_date,
      discountRange: `${deal.min_discount}-${deal.max_discount}%`,
      membershipTier: deal.membership_tier,
      location: deal.location,
      city: deal.city,
      redemptionInfo: {
        maxRedemptions: deal.max_redemptions || "unlimited",
        totalRedemptions: deal.total_redemptions || 0,
        limitPerUser: deal.redemption_limit_per_user || "unlimited",
        period: deal.redemption_period || "total",
        remainingUses:
          deal.max_redemptions > 0
            ? deal.max_redemptions - (deal.total_redemptions || 0)
            : "unlimited",
      },
      status: deal.status,
    }));

    console.log("🎯 Final response data:", {
      transformedDeals,
      count: transformedDeals.length,
    });

    res.json({
      success: true,
      data: transformedDeals,
      count: transformedDeals.length,
    });
  } catch (error) {
    console.error("Error fetching available deals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch available deals",
    });
  }
});

// GET /api/v1/partners/redemptions - Get partner's processed redemptions
router.get("/redemptions", verifyToken, async (req, res) => {
  try {
    const partnerUser = req.user;
    const { page = 1, limit = 20, dealId } = req.query;
    const offset = (page - 1) * limit;

    // Verify the requester is a partner
    if (partnerUser.role !== "partner" && partnerUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only partners can access redemption history",
      });
    }

    // Get partner details
    const { data: partnerData, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", partnerUser.id)
      .single();

    if (partnerError || !partnerData) {
      return res.status(403).json({
        success: false,
        error: "Partner profile not found",
      });
    }

    // Build query for redemptions (simplified without joins first)
    let query = supabase
      .from("redemptions")
      .select(
        `
        id,
        user_id,
        deal_id,
        discount_amount,
        original_amount,
        final_amount,
        redemption_method,
        redemption_code,
        redeemed_at,
        notes
      `
      )
      .eq("partner_id", partnerData.id);

    // Filter by deal if specified
    if (dealId) {
      query = query.eq("deal_id", dealId);
    }

    const { data: redemptions, error } = await query
      .order("redeemed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch redemption history",
      });
    }

    // If we have redemptions, fetch related user and deal data
    let enrichedRedemptions = redemptions;
    if (redemptions && redemptions.length > 0) {
      try {
        // Get unique user IDs and deal IDs
        const userIds = [...new Set(redemptions.map((r) => r.user_id))];
        const dealIds = [...new Set(redemptions.map((r) => r.deal_id))];

        // Fetch users data
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds);

        // Fetch deals data
        const { data: deals } = await supabase
          .from("deals")
          .select("id, title, description, min_discount, max_discount")
          .in("id", dealIds);

        // Create lookup maps
        const usersMap = {};
        const dealsMap = {};

        if (users) {
          users.forEach((user) => {
            usersMap[user.id] = user;
          });
        }

        if (deals) {
          deals.forEach((deal) => {
            dealsMap[deal.id] = deal;
          });
        }

        // Enrich redemptions with user and deal data
        enrichedRedemptions = redemptions.map((redemption) => ({
          ...redemption,
          users: usersMap[redemption.user_id] || null,
          deals: dealsMap[redemption.deal_id]
            ? {
                deal_title: dealsMap[redemption.deal_id].title,
                description: dealsMap[redemption.deal_id].description,
                min_discount: dealsMap[redemption.deal_id].min_discount,
                max_discount: dealsMap[redemption.deal_id].max_discount,
              }
            : null,
        }));
      } catch (enrichError) {
        console.error("Error enriching redemption data:", enrichError);
        // Continue with basic redemption data if enrichment fails
      }
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("redemptions")
      .select("id", { count: "exact" })
      .eq("partner_id", partnerData.id);

    if (countError) {
      console.error("Count error:", countError);
    }

    res.json({
      success: true,
      data: enrichedRedemptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || enrichedRedemptions.length,
        totalPages: Math.ceil((count || enrichedRedemptions.length) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch redemption history",
    });
  }
});

// GET /api/v1/partners/:id - Get single partner
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement database query
    // For now, return dummy data
    const partner = {
      id: parseInt(id),
      brandName: "Chai Wala Corner",
      ownerName: "Rashid Ali",
      email: "chaiwala@example.com",
      businessType: "Food & Drink",
      city: "Islamabad",
      discountRange: "10-25%",
      status: "approved",
    };

    res.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error("Error fetching partner:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch partner",
    });
  }
});

// POST /api/v1/partners/:id/approve - Approve partner (admin only)
router.post("/:id/approve", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if partner exists and is pending
    const { data: existingPartner, error: checkError } = await supabase
      .from("partners")
      .select("id, brand_name, owner_name, email, phone, status")
      .eq("id", id)
      .single();

    if (checkError || !existingPartner) {
      return res.status(404).json({
        success: false,
        error: "Partner not found",
      });
    }

    if (existingPartner.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Partner is already ${existingPartner.status}`,
      });
    }

    let userId = null;
    let tempPassword = null;
    let authUserCreated = false;

    // First, check if user already exists in our users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", existingPartner.email.toLowerCase())
      .single();

    if (existingUser) {
      // User already exists in our system
      userId = existingUser.id;
      console.log(
        `User already exists: ${existingUser.email} (${existingUser.id})`
      );

      // Update the existing user role to partner if needed
      if (existingUser.role !== "partner") {
        const { error: roleUpdateError } = await supabase
          .from("users")
          .update({
            role: "partner",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.id);

        if (roleUpdateError) {
          console.error("Role update error:", roleUpdateError);
        } else {
          console.log(`Updated user role to partner: ${existingUser.email}`);
        }
      }
    } else {
      // User doesn't exist, create new auth user
      tempPassword = `GoSave${Math.random().toString(36).slice(-8)}!`;

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: existingPartner.email.toLowerCase(),
          password: tempPassword,
          user_metadata: {
            full_name: existingPartner.owner_name,
            phone: existingPartner.phone || null,
            role: "partner",
            brand_name: existingPartner.brand_name,
          },
          email_confirm: true,
        });

      if (authError) {
        console.error("Auth creation error:", authError);
        return res.status(400).json({
          success: false,
          error: `Failed to create partner account: ${authError.message}`,
        });
      }

      userId = authData?.user?.id;
      authUserCreated = true;

      // Create user record in our database
      if (userId) {
        const { error: userError } = await supabase.from("users").insert({
          id: userId,
          email: existingPartner.email.toLowerCase(),
          full_name: existingPartner.owner_name,
          phone: existingPartner.phone || null,
          role: "partner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (userError) {
          console.error("User record creation error:", userError);
          return res.status(400).json({
            success: false,
            error: `Failed to create user record: ${userError.message}`,
          });
        }
      }
    }

    // Approve the partner
    const { data: approvedPartner, error } = await supabase
      .from("partners")
      .update({
        status: "approved",
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
        user_id: userId || null, // Link to auth user if created
      })
      .eq("id", id)
      .select(
        `
        id,
        brand_name,
        owner_name,
        email,
        status,
        approved_at,
        admin_notes,
        user_id
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to approve partner",
      });
    }

    // Log success with additional info
    const authStatus = authUserCreated
      ? "✅ New auth user created"
      : "✅ Existing user linked";
    console.log(
      `✅ Admin ${req.user.email} approved partner: ${approvedPartner.brand_name} (${approvedPartner.email})`
    );
    console.log(
      `${authStatus}${tempPassword ? ` - Temp password: ${tempPassword}` : ""}`
    );

    res.json({
      success: true,
      data: {
        id: approvedPartner.id,
        brandName: approvedPartner.brand_name,
        ownerName: approvedPartner.owner_name,
        email: approvedPartner.email,
        status: approvedPartner.status,
        approvedAt: approvedPartner.approved_at,
        adminNotes: approvedPartner.admin_notes,
        userId: approvedPartner.user_id,
        // Include temp password in response only if new user was created
        tempPassword: tempPassword,
        userCreated: authUserCreated,
      },
      message: authUserCreated
        ? "Partner approved successfully and new user account created"
        : "Partner approved successfully and linked to existing user account",
    });
  } catch (error) {
    console.error("Error approving partner:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/v1/partners/:id/reject - Reject partner (admin only)
router.post("/:id/reject", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason must be at least 5 characters long",
      });
    }

    // Check if partner exists and is pending
    const { data: existingPartner, error: checkError } = await supabase
      .from("partners")
      .select("id, brand_name, email, status")
      .eq("id", id)
      .single();

    if (checkError || !existingPartner) {
      return res.status(404).json({
        success: false,
        error: "Partner not found",
      });
    }

    if (existingPartner.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Partner is already ${existingPartner.status}`,
      });
    }

    // Reject the partner
    const { data: rejectedPartner, error } = await supabase
      .from("partners")
      .update({
        status: "rejected",
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: reason.trim(),
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        brand_name,
        owner_name,
        email,
        status,
        rejection_reason,
        admin_notes
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reject partner",
      });
    }

    console.log(
      `❌ Admin ${req.user.email} rejected partner: ${rejectedPartner.brand_name} (${rejectedPartner.email}) - Reason: ${reason}`
    );

    res.json({
      success: true,
      data: {
        id: rejectedPartner.id,
        brandName: rejectedPartner.brand_name,
        ownerName: rejectedPartner.owner_name,
        email: rejectedPartner.email,
        status: rejectedPartner.status,
        rejectionReason: rejectedPartner.rejection_reason,
        adminNotes: rejectedPartner.admin_notes,
      },
      message: "Partner rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting partner:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/v1/partners/:id - Update partner details (admin only)
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand_name,
      owner_name,
      email,
      phone,
      website,
      business_type,
      address,
      city,
      min_discount,
      max_discount,
      contract_duration_months,
      admin_notes,
    } = req.body;

    // Validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    if (
      min_discount !== undefined &&
      (min_discount < 0 || min_discount > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Minimum discount must be between 0 and 100",
      });
    }

    if (
      max_discount !== undefined &&
      (max_discount < 0 || max_discount > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Maximum discount must be between 0 and 100",
      });
    }

    if (
      min_discount !== undefined &&
      max_discount !== undefined &&
      min_discount > max_discount
    ) {
      return res.status(400).json({
        success: false,
        error: "Minimum discount cannot be greater than maximum discount",
      });
    }

    // Build update object (only include provided fields)
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (brand_name !== undefined) updateData.brand_name = brand_name.trim();
    if (owner_name !== undefined) updateData.owner_name = owner_name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (website !== undefined) updateData.website = website.trim() || null;
    if (business_type !== undefined)
      updateData.business_type = business_type.trim();
    if (address !== undefined) updateData.address = address.trim() || null;
    if (city !== undefined) updateData.city = city.trim();
    if (min_discount !== undefined) updateData.min_discount = min_discount;
    if (max_discount !== undefined) updateData.max_discount = max_discount;
    if (contract_duration_months !== undefined)
      updateData.contract_duration_months = contract_duration_months;
    if (admin_notes !== undefined)
      updateData.admin_notes = admin_notes.trim() || null;

    // Check if email is already taken by another partner
    if (email) {
      const { data: existingPartner, error: checkError } = await supabase
        .from("partners")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", id)
        .single();

      if (existingPartner) {
        return res.status(409).json({
          success: false,
          error: "Email address is already in use by another partner",
        });
      }
    }

    // Update partner
    const { data: updatedPartner, error } = await supabase
      .from("partners")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        brand_name,
        owner_name,
        email,
        phone,
        website,
        business_type,
        address,
        city,
        min_discount,
        max_discount,
        contract_duration_months,
        status,
        admin_notes,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({
        success: false,
        error: "Partner not found or update failed",
      });
    }

    console.log(
      `✅ Admin ${req.user.email} updated partner: ${updatedPartner.brand_name}`
    );

    res.json({
      success: true,
      data: {
        id: updatedPartner.id,
        brandName: updatedPartner.brand_name,
        ownerName: updatedPartner.owner_name,
        email: updatedPartner.email,
        phone: updatedPartner.phone,
        website: updatedPartner.website,
        businessType: updatedPartner.business_type,
        address: updatedPartner.address,
        city: updatedPartner.city,
        minDiscount: updatedPartner.min_discount,
        maxDiscount: updatedPartner.max_discount,
        contractDuration: updatedPartner.contract_duration_months,
        status: updatedPartner.status,
        adminNotes: updatedPartner.admin_notes,
        updatedAt: updatedPartner.updated_at,
      },
      message: "Partner updated successfully",
    });
  } catch (error) {
    console.error("Error updating partner:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/v1/partners/:id/deals - Get partner's deals (admin only)
router.get("/:id/deals", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if partner exists
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id, brand_name, email")
      .eq("id", id)
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({
        success: false,
        error: "Partner not found",
      });
    }

    // Get partner's deals
    const { data: deals, error } = await supabase
      .from("deals")
      .select(
        `
        id,
        deal_title,
        description,
        start_date,
        end_date,
        min_discount,
        max_discount,
        membership_tier,
        location,
        city,
        created_at
      `
      )
      .eq("partner_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch partner's deals",
      });
    }

    // Transform deals data
    const transformedDeals = deals.map((deal) => ({
      id: deal.id,
      title: deal.deal_title,
      description: deal.description,
      startDate: deal.start_date,
      endDate: deal.end_date,
      discountRange: `${deal.min_discount || 0}-${deal.max_discount || 0}%`,
      membershipTier: deal.membership_tier,
      location: deal.location,
      city: deal.city,
      createdAt: deal.created_at,
      isActive: new Date(deal.end_date) >= new Date(),
    }));

    res.json({
      success: true,
      data: {
        partner: {
          id: partner.id,
          brandName: partner.brand_name,
          email: partner.email,
        },
        deals: transformedDeals,
        count: transformedDeals.length,
      },
      message: `Found ${transformedDeals.length} deals for ${partner.brand_name}`,
    });
  } catch (error) {
    console.error("Error fetching partner deals:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/v1/partners/apply - Submit partner application (public endpoint)
router.post("/apply", async (req, res) => {
  try {
    const {
      brand_name,
      owner_name,
      email,
      phone,
      website,
      business_type,
      address,
      city,
      min_discount,
      max_discount,
      contract_duration_months,
      description, // Optional business description
    } = req.body;

    // Validation
    if (
      !brand_name ||
      !owner_name ||
      !email ||
      !phone ||
      !business_type ||
      !address ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        error: "Please fill all required fields",
        required: [
          "brand_name",
          "owner_name",
          "email",
          "phone",
          "business_type",
          "address",
          "city",
        ],
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
      });
    }

    // Check if partner already exists
    const { data: existingPartner, error: checkError } = await supabase
      .from("partners")
      .select("id, status, email")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Database error checking existing partner:", checkError);
      return res.status(500).json({
        success: false,
        error: "Failed to process application",
      });
    }

    if (existingPartner) {
      const statusMessage = {
        pending: "Your application is already submitted and under review",
        approved: "You are already an approved partner",
        rejected:
          "Your previous application was rejected. Please contact support for more information",
      };

      return res.status(400).json({
        success: false,
        error:
          statusMessage[existingPartner.status] || "Application already exists",
        existingStatus: existingPartner.status,
      });
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Database error checking existing user:", userCheckError);
      return res.status(500).json({
        success: false,
        error: "Failed to process application",
      });
    }

    // Start transaction-like operations
    let userId = null;

    // Create user account if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: userCreateError } = await supabase
        .from("users")
        .insert([
          {
            email: email,
            full_name: owner_name,
            role: "partner",
            status: "active",
          },
        ])
        .select("id")
        .single();

      if (userCreateError) {
        console.error("Error creating user account:", userCreateError);
        return res.status(500).json({
          success: false,
          error: "Failed to create user account",
        });
      }

      userId = newUser.id;
      console.log(`✅ Created user account for: ${email} with role 'partner'`);
    } else {
      // Update existing user role to partner if not already
      if (existingUser.role !== "partner") {
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "partner" })
          .eq("id", existingUser.id);

        if (updateError) {
          console.error("Error updating user role:", updateError);
          // Continue anyway - partner application is more important
        } else {
          console.log(`✅ Updated user role to 'partner' for: ${email}`);
        }
      }
      userId = existingUser.id;
    }

    // Create partner application
    const partnerData = {
      brand_name,
      owner_name,
      email,
      phone,
      website: website || null,
      business_type,
      address,
      city,
      min_discount: min_discount ? parseFloat(min_discount) : null,
      max_discount: max_discount ? parseFloat(max_discount) : null,
      contract_duration_months: contract_duration_months
        ? parseInt(contract_duration_months)
        : 12,
      status: "pending",
      admin_notes: description || null, // Store description in admin_notes temporarily
    };

    const { data: newPartner, error: partnerError } = await supabase
      .from("partners")
      .insert([partnerData])
      .select("id")
      .single();

    if (partnerError) {
      console.error("Error creating partner application:", partnerError);
      return res.status(500).json({
        success: false,
        error: "Failed to submit application",
      });
    }

    // Log successful application
    console.log(`🎉 New partner application submitted:
      Brand: ${brand_name}
      Owner: ${owner_name} 
      Email: ${email}
      Business: ${business_type}
      City: ${city}
      User ID: ${userId}
      Partner ID: ${newPartner.id}
    `);

    res.status(201).json({
      success: true,
      message: "Partner application submitted successfully!",
      data: {
        applicationId: newPartner.id,
        email: email,
        brandName: brand_name,
        status: "pending",
        message:
          "Your application is now under review. You will be notified once it's processed.",
      },
    });
  } catch (error) {
    console.error("Error submitting partner application:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit application. Please try again later.",
    });
  }
});

// GET /api/v1/partners/application-status/:email - Check application status (public endpoint)
router.get("/application-status/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const { data: partner, error } = await supabase
      .from("partners")
      .select(
        "id, brand_name, status, created_at, approved_at, rejection_reason"
      )
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          error: "No application found for this email address",
        });
      }

      console.error("Database error checking application status:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check application status",
      });
    }

    const statusMessages = {
      pending: "Your application is under review",
      approved: "Congratulations! Your application has been approved",
      rejected: "Your application has been rejected",
    };

    res.json({
      success: true,
      data: {
        applicationId: partner.id,
        brandName: partner.brand_name,
        status: partner.status,
        message: statusMessages[partner.status],
        submittedAt: partner.created_at,
        processedAt: partner.approved_at || null,
        rejectionReason:
          partner.status === "rejected" ? partner.rejection_reason : null,
      },
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check application status",
    });
  }
});

// ============================================
// PARTNER REDEMPTION ENDPOINTS (Week 4)
// ============================================

// POST /api/v1/partners/validate-user - Validate user ID for redemption
router.post("/validate-user", verifyToken, async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    const partnerUser = req.user;

    // Verify the requester is a partner
    if (partnerUser.role !== "partner" && partnerUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only partners can validate users",
      });
    }

    // Validate input
    if (!userId && !userEmail) {
      return res.status(400).json({
        success: false,
        error: "Either User ID or email is required",
      });
    }

    // Build query based on provided input
    let query = supabase.from("users").select(`
        id,
        full_name,
        email,
        role,
        membership_expires_at,
        last_redemption_at,
        created_at
      `);

    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", userEmail);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
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
        memberSince: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate user",
    });
  }
});

module.exports = router;
