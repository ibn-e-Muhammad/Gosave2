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

module.exports = router;
