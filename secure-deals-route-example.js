// Example of secure deals route with application-level security
const express = require("express");
const { supabase } = require("../../../config/supabase");
const { verifyToken } = require("../../../middleware/auth");
const { 
  requireMember, 
  requirePremium, 
  secureQueries, 
  auditLog 
} = require("../../../middleware/application-security-middleware");

const router = express.Router();

// GET /api/v1/deals - Get all deals (public, with membership filtering)
router.get("/", async (req, res) => {
  try {
    // Get user context if authenticated (optional for this endpoint)
    const userMembership = req.user?.membership?.name || 'basic';
    const userRole = req.user?.role || 'viewer';
    
    // Use secure query that applies membership filtering
    const { data: deals, error } = await secureQueries.getDealsForUser(userMembership, userRole);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch deals",
      });
    }

    // Log access for audit
    if (req.user) {
      auditLog.logAccess(req.user.id, 'deals', 'view_all');
    }

    res.json({
      success: true,
      data: deals,
      count: deals.length,
      user_membership: userMembership
    });

  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/v1/deals/my-deals - Get deals for authenticated user
router.get("/my-deals", verifyToken, requireMember, async (req, res) => {
  try {
    const userMembership = req.user.membership?.name || 'basic';
    const userRole = req.user.role;
    
    // Use secure query with user context
    const { data: deals, error } = await secureQueries.getDealsForUser(userMembership, userRole);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user deals",
      });
    }

    // Log access
    auditLog.logAccess(req.user.id, 'deals', 'view_my_deals');

    res.json({
      success: true,
      data: deals,
      count: deals.length,
      membership: userMembership
    });

  } catch (error) {
    console.error("Error fetching user deals:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/v1/deals/premium - Get premium deals (premium members only)
router.get("/premium", verifyToken, requirePremium, async (req, res) => {
  try {
    // Premium users get access to premium-only deals
    const { data: deals, error } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        description,
        image_url,
        premium_discount,
        start_date,
        end_date,
        category,
        partners (
          name,
          logo_url
        )
      `)
      .not('premium_discount', 'is', null)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString());

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch premium deals",
      });
    }

    // Log premium access
    auditLog.logAccess(req.user.id, 'premium_deals', 'view');

    res.json({
      success: true,
      data: deals,
      count: deals.length,
      access_level: 'premium'
    });

  } catch (error) {
    console.error("Error fetching premium deals:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/v1/deals - Create new deal (admin only)
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, basic_discount, premium_discount, partner_id, category } = req.body;

    // Validate required fields
    if (!title || !description || !partner_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, description, partner_id"
      });
    }

    // Create deal with admin user context
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        title,
        description,
        basic_discount,
        premium_discount,
        partner_id,
        category,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create deal",
      });
    }

    // Log admin action
    auditLog.logAccess(req.user.id, 'deals', 'create', true);
    auditLog.logSecurityEvent(req.user.id, 'DEAL_CREATED', `Deal ID: ${deal.id}`);

    res.status(201).json({
      success: true,
      data: deal,
      message: "Deal created successfully"
    });

  } catch (error) {
    console.error("Error creating deal:", error);
    auditLog.logAccess(req.user.id, 'deals', 'create', false);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
