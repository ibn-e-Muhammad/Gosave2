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

// POST /api/v1/partners/:id/approve - Approve partner (admin only)
router.post("/:id/approve", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

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

    // Approve the partner
    const { data: approvedPartner, error } = await supabase
      .from("partners")
      .update({
        status: "approved",
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
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
        approved_at,
        admin_notes
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

    console.log(
      `✅ Admin ${req.user.email} approved partner: ${approvedPartner.brand_name} (${approvedPartner.email})`
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
      },
      message: "Partner approved successfully",
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

module.exports = router;
