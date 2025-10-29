const express = require("express");
const { supabase } = require("../../../config/supabase");
const {
  verifyToken,
  requireValidMembership,
  requirePremiumMembership,
  requireAdmin,
} = require("../../../middleware/auth");
const router = express.Router();

// GET /api/v1/deals - Get all deals
router.get("/", async (req, res) => {
  try {
    // Query deals with partner information
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
        partners (
          brand_name,
          business_type
        )
      `
      )
      .gte("end_date", new Date().toISOString().split("T")[0]) // Only active deals
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch deals",
      });
    }

    // Transform data to match frontend expectations
    const transformedDeals = deals.map((deal) => ({
      id: deal.id,
      title: deal.deal_title,
      description: deal.description,
      brand: deal.partners?.brand_name || "Unknown Brand",
      category: deal.partners?.business_type || "General",
      discount:
        deal.min_discount === deal.max_discount
          ? `${deal.min_discount}%`
          : `${deal.min_discount}-${deal.max_discount}%`,
      location: deal.location,
      city: deal.city,
      tier: deal.membership_tier,
      startDate: deal.start_date,
      endDate: deal.end_date,
      basic_discount:
        deal.membership_tier === "basic" || deal.membership_tier === "both"
          ? deal.min_discount
          : null,
      premium_discount:
        deal.membership_tier === "premium" || deal.membership_tier === "both"
          ? deal.max_discount
          : null,
      valid_until: deal.end_date,
    }));

    res.json({
      success: true,
      data: transformedDeals,
      count: transformedDeals.length,
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deals",
    });
  }
});

// GET /api/v1/deals/my-deals - Get deals for authenticated user based on membership
router.get("/my-deals", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    let membershipFilter = [];

    // Determine which deals the user can access based on their membership
    if (user.role === "admin") {
      // Admins can see all deals
      membershipFilter = ["basic", "premium", "both"];
    } else if (user.membership) {
      if (user.membership.name === "premium") {
        // Premium members can see premium and both tier deals
        membershipFilter = ["premium", "both"];
      } else if (user.membership.name === "basic") {
        // Basic members can see basic and both tier deals
        membershipFilter = ["basic", "both"];
      }
    } else {
      // Non-members can only see basic deals
      membershipFilter = ["basic"];
    }

    // Query deals with membership filtering
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
        partners (
          brand_name,
          business_type
        )
      `
      )
      .gte("end_date", new Date().toISOString().split("T")[0]) // Only active deals
      .in("membership_tier", membershipFilter)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch deals",
      });
    }

    // Transform data to match frontend expectations
    const transformedDeals = deals.map((deal) => ({
      id: deal.id,
      title: deal.deal_title,
      description: deal.description,
      brand: deal.partners?.brand_name || "Unknown Brand",
      category: deal.partners?.business_type || "General",
      discount:
        deal.min_discount === deal.max_discount
          ? `${deal.min_discount}%`
          : `${deal.min_discount}-${deal.max_discount}%`,
      location: deal.location,
      city: deal.city,
      tier: deal.membership_tier,
      startDate: deal.start_date,
      endDate: deal.end_date,
      basic_discount:
        deal.membership_tier === "basic" || deal.membership_tier === "both"
          ? deal.min_discount
          : null,
      premium_discount:
        deal.membership_tier === "premium" || deal.membership_tier === "both"
          ? deal.max_discount
          : null,
      valid_until: deal.end_date,
      canAccess: true, // User can access all deals returned by this endpoint
    }));

    res.json({
      success: true,
      data: transformedDeals,
      count: transformedDeals.length,
      user_membership: user.membership?.name || "none",
      message: `Showing deals for ${
        user.membership?.name || "non-member"
      } users`,
    });
  } catch (error) {
    console.error("Error fetching user deals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user deals",
    });
  }
});

// GET /api/v1/deals/premium - Get premium deals (requires premium membership)
router.get(
  "/premium",
  verifyToken,
  requirePremiumMembership,
  async (req, res) => {
    try {
      // Query premium deals only
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
        partners (
          brand_name,
          business_type
        )
      `
        )
        .gte("end_date", new Date().toISOString().split("T")[0])
        .eq("membership_tier", "premium")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch premium deals",
        });
      }

      // Transform data
      const transformedDeals = deals.map((deal) => ({
        id: deal.id,
        title: deal.deal_title,
        description: deal.description,
        brand: deal.partners?.brand_name || "Unknown Brand",
        category: deal.partners?.business_type || "General",
        discount: `${deal.max_discount}%`,
        location: deal.location,
        city: deal.city,
        tier: deal.membership_tier,
        startDate: deal.start_date,
        endDate: deal.end_date,
        premium_discount: deal.max_discount,
        valid_until: deal.end_date,
      }));

      res.json({
        success: true,
        data: transformedDeals,
        count: transformedDeals.length,
        message: "Premium deals for premium members",
      });
    } catch (error) {
      console.error("Error fetching premium deals:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch premium deals",
      });
    }
  }
);

// GET /api/v1/deals/:id - Get single deal
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement database query
    // For now, return dummy data
    const deal = {
      id: parseInt(id),
      title: "Buy 2 Parathas, 1 Free",
      description: "Valid on weekends only",
      brand: "Chai Wala Corner",
      discount: "10-20%",
      location: "G-9 Markaz, Islamabad",
      city: "Islamabad",
      tier: "basic",
      startDate: "2025-08-16",
      endDate: "2025-10-23",
    };

    res.json({
      success: true,
      data: deal,
    });
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deal",
    });
  }
});

// === ADMIN ROUTES FOR DEAL MANAGEMENT ===

// GET /api/v1/deals/admin/all - Get all deals (admin only)
router.get("/admin/all", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, category, partner_id, search } = req.query;

    let query = supabase
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
        image_url,
        terms_conditions,
        usage_instructions,
        max_redemptions,
        current_redemptions,
        is_featured,
        status,
        created_at,
        updated_at,
        partners (
          id,
          brand_name,
          business_type,
          status
        ),
        deal_categories (
          id,
          name
        ),
        created_by:users!deals_created_by_fkey (
          id,
          full_name
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category_id", category);
    }
    if (partner_id) {
      query = query.eq("partner_id", partner_id);
    }
    if (search) {
      query = query.or(
        `deal_title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: deals, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch admin deals",
      });
    }

    // Transform data
    const transformedDeals = deals.map((deal) => ({
      id: deal.id,
      title: deal.deal_title,
      description: deal.description,
      brand: deal.partners?.brand_name || "Unknown Brand",
      brandId: deal.partners?.id,
      category: deal.deal_categories?.name || "Uncategorized",
      categoryId: deal.deal_categories?.id,
      discount:
        deal.min_discount === deal.max_discount
          ? `${deal.min_discount}%`
          : `${deal.min_discount}-${deal.max_discount}%`,
      minDiscount: deal.min_discount,
      maxDiscount: deal.max_discount,
      location: deal.location,
      city: deal.city,
      tier: deal.membership_tier,
      startDate: deal.start_date,
      endDate: deal.end_date,
      imageUrl: deal.image_url,
      termsConditions: deal.terms_conditions,
      usageInstructions: deal.usage_instructions,
      maxRedemptions: deal.max_redemptions,
      currentRedemptions: deal.current_redemptions,
      isFeatured: deal.is_featured,
      status: deal.status,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
      createdBy: deal.created_by?.full_name || "Unknown",
      partnerStatus: deal.partners?.status,
      isActive:
        deal.status === "active" && new Date(deal.end_date) >= new Date(),
    }));

    res.json({
      success: true,
      data: transformedDeals,
      count: transformedDeals.length,
    });
  } catch (error) {
    console.error("Error fetching admin deals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin deals",
    });
  }
});

// POST /api/v1/deals/admin/create - Create new deal (admin only)
router.post("/admin/create", verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      partner_id,
      deal_title,
      description,
      start_date,
      end_date,
      min_discount,
      max_discount,
      membership_tier,
      location,
      city,
      image_url,
      terms_conditions,
      usage_instructions,
      max_redemptions,
      is_featured,
      status,
      category_id,
    } = req.body;

    // Validation
    if (
      !partner_id ||
      !deal_title ||
      !start_date ||
      !end_date ||
      !min_discount
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Validate partner exists and is approved
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id, status")
      .eq("id", partner_id)
      .eq("status", "approved")
      .single();

    if (partnerError || !partner) {
      return res.status(400).json({
        success: false,
        error: "Invalid or unapproved partner",
      });
    }

    // Create deal
    const { data: deal, error } = await supabase
      .from("deals")
      .insert([
        {
          partner_id,
          deal_title,
          description,
          start_date,
          end_date,
          min_discount,
          max_discount: max_discount || min_discount,
          membership_tier: membership_tier || "basic",
          location,
          city,
          image_url,
          terms_conditions,
          usage_instructions,
          max_redemptions: max_redemptions || 0,
          current_redemptions: 0,
          is_featured: is_featured || false,
          status: status || "active",
          category_id,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create deal",
      });
    }

    res.status(201).json({
      success: true,
      data: deal,
      message: "Deal created successfully",
    });
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create deal",
    });
  }
});

// PUT /api/v1/deals/admin/:id - Update deal (admin only)
router.put("/admin/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      deal_title,
      description,
      start_date,
      end_date,
      min_discount,
      max_discount,
      membership_tier,
      location,
      city,
      image_url,
      terms_conditions,
      usage_instructions,
      max_redemptions,
      is_featured,
      status,
      category_id,
    } = req.body;

    // Check if deal exists
    const { data: existingDeal, error: fetchError } = await supabase
      .from("deals")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingDeal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
      });
    }

    // Update deal
    const updateData = {};
    if (deal_title !== undefined) updateData.deal_title = deal_title;
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (min_discount !== undefined) updateData.min_discount = min_discount;
    if (max_discount !== undefined) updateData.max_discount = max_discount;
    if (membership_tier !== undefined)
      updateData.membership_tier = membership_tier;
    if (location !== undefined) updateData.location = location;
    if (city !== undefined) updateData.city = city;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (terms_conditions !== undefined)
      updateData.terms_conditions = terms_conditions;
    if (usage_instructions !== undefined)
      updateData.usage_instructions = usage_instructions;
    if (max_redemptions !== undefined)
      updateData.max_redemptions = max_redemptions;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (status !== undefined) updateData.status = status;
    if (category_id !== undefined) updateData.category_id = category_id;

    updateData.updated_by = req.user.id;

    const { data: deal, error } = await supabase
      .from("deals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update deal",
      });
    }

    res.json({
      success: true,
      data: deal,
      message: "Deal updated successfully",
    });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update deal",
    });
  }
});

// DELETE /api/v1/deals/admin/:id - Delete deal (admin only)
router.delete("/admin/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if deal exists
    const { data: existingDeal, error: fetchError } = await supabase
      .from("deals")
      .select("id, deal_title")
      .eq("id", id)
      .single();

    if (fetchError || !existingDeal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
      });
    }

    // Delete deal (this will also delete related analytics due to CASCADE)
    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete deal",
      });
    }

    res.json({
      success: true,
      message: `Deal "${existingDeal.deal_title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete deal",
    });
  }
});

// GET /api/v1/deals/admin/analytics - Get deal analytics (admin only)
router.get("/admin/analytics", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { deal_id, start_date, end_date, action_type } = req.query;

    let analyticsQuery = supabase
      .from("deal_analytics")
      .select(
        `
        id,
        action_type,
        created_at,
        deals (
          id,
          deal_title,
          partners (
            brand_name
          )
        ),
        users (
          id,
          full_name
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (deal_id) {
      analyticsQuery = analyticsQuery.eq("deal_id", deal_id);
    }
    if (start_date) {
      analyticsQuery = analyticsQuery.gte("created_at", start_date);
    }
    if (end_date) {
      analyticsQuery = analyticsQuery.lte("created_at", end_date);
    }
    if (action_type) {
      analyticsQuery = analyticsQuery.eq("action_type", action_type);
    }

    const { data: analytics, error: analyticsError } =
      await analyticsQuery.limit(1000);

    // Get summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_deal_analytics_summary",
      {
        p_start_date: start_date || "1970-01-01",
        p_end_date: end_date || "2099-12-31",
        p_deal_id: deal_id || null,
      }
    );

    if (analyticsError) {
      console.error("Analytics error:", analyticsError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch deal analytics",
      });
    }

    // Transform analytics data
    const transformedAnalytics =
      analytics?.map((item) => ({
        id: item.id,
        actionType: item.action_type,
        createdAt: item.created_at,
        dealTitle: item.deals?.deal_title,
        brandName: item.deals?.partners?.brand_name,
        userName: item.users?.full_name,
      })) || [];

    res.json({
      success: true,
      data: {
        analytics: transformedAnalytics,
        summary: summaryData?.[0] || {
          total_views: 0,
          total_clicks: 0,
          total_redeems: 0,
          total_saves: 0,
          unique_users: 0,
        },
      },
      count: transformedAnalytics.length,
    });
  } catch (error) {
    console.error("Error fetching deal analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deal analytics",
    });
  }
});

// GET /api/v1/deals/admin/categories - Get all deal categories (admin only)
router.get("/admin/categories", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("deal_categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch categories",
      });
    }

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
});

// ============================================
// DEAL REDEMPTION ENDPOINTS (Week 4)
// ============================================

// POST /api/v1/deals/:dealId/check-eligibility - Check if user can redeem a deal
router.post("/:dealId/check-eligibility", verifyToken, async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user.id;

    // Call the database function to check eligibility
    const { data, error } = await supabase.rpc(
      "check_user_redemption_eligibility",
      {
        p_user_id: userId,
        p_deal_id: dealId,
      }
    );

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check eligibility",
      });
    }

    const eligibilityResult = data;

    if (eligibilityResult.eligible) {
      res.json({
        success: true,
        eligible: true,
        data: eligibilityResult,
      });
    } else {
      res.json({
        success: true,
        eligible: false,
        reason: eligibilityResult.reason,
      });
    }
  } catch (error) {
    console.error("Error checking eligibility:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check eligibility",
    });
  }
});

// POST /api/v1/deals/:dealId/redeem - Process deal redemption (Partner Only)
router.post("/:dealId/redeem", verifyToken, async (req, res) => {
  try {
    const { dealId } = req.params;
    const partnerUser = req.user;
    const {
      userId,
      discountAmount,
      originalAmount,
      redemptionMethod = "manual",
      notes,
    } = req.body;

    // Verify the requester is a partner
    if (partnerUser.role !== "partner" && partnerUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only partners can process redemptions",
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

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Process the redemption using the database function
    const { data, error } = await supabase.rpc("process_deal_redemption", {
      p_user_id: userId,
      p_partner_id: partnerData.id,
      p_deal_id: dealId,
      p_redeemed_by: partnerUser.id,
      p_discount_amount: discountAmount || null,
      p_original_amount: originalAmount || null,
      p_redemption_method: redemptionMethod,
      p_notes: notes || null,
    });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process redemption",
      });
    }

    const redemptionResult = data;

    if (redemptionResult.success) {
      res.json({
        success: true,
        data: {
          redemptionId: redemptionResult.redemption_id,
          redemptionCode: redemptionResult.redemption_code,
          message: redemptionResult.message,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: redemptionResult.error,
      });
    }
  } catch (error) {
    console.error("Error processing redemption:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process redemption",
    });
  }
});

// GET /api/v1/deals/redemptions/my-history - Get user's redemption history
router.get("/redemptions/my-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get user's redemption history with deal and partner details
    const { data: redemptions, error } = await supabase
      .from("redemptions")
      .select(
        `
        id,
        discount_amount,
        original_amount,
        final_amount,
        redemption_method,
        redemption_code,
        redeemed_at,
        notes,
        deals (
          deal_title,
          description,
          min_discount,
          max_discount
        ),
        partners (
          brand_name,
          business_type
        )
      `
      )
      .eq("user_id", userId)
      .order("redeemed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch redemption history",
      });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("redemptions")
      .select("id", { count: "exact" })
      .eq("user_id", userId);

    if (countError) {
      console.error("Count error:", countError);
    }

    res.json({
      success: true,
      data: redemptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || redemptions.length,
        totalPages: Math.ceil((count || redemptions.length) / limit),
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

module.exports = router;
