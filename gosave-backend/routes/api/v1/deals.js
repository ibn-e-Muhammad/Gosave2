const express = require("express");
const { supabase } = require("../../../config/supabase");
const {
  verifyToken,
  requireValidMembership,
  requirePremiumMembership,
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

module.exports = router;
