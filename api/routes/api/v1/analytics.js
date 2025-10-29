const express = require("express");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const router = express.Router();

// Import middleware
const { verifyToken } = require("../../../middleware/auth");

// Simple in-memory cache for analytics data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utility functions
const getCacheKey = (endpoint, params = {}) => {
  const paramString = Object.keys(params).length ? JSON.stringify(params) : "";
  return `${endpoint}:${paramString}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Performance monitoring utility
const measureTime = (label) => {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    console.log(`⏱️  ${label}: ${duration}ms`);
    return duration;
  };
};

// Input validation utility
const validateDateRange = (startDate, endDate) => {
  if (startDate && isNaN(new Date(startDate).getTime())) {
    throw new Error("Invalid start_date format. Use YYYY-MM-DD");
  }
  if (endDate && isNaN(new Date(endDate).getTime())) {
    throw new Error("Invalid end_date format. Use YYYY-MM-DD");
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("start_date must be before end_date");
  }
};

// Error response utility
const sendError = (res, error, statusCode = 500) => {
  console.error("❌ Analytics Error:", error);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    success: false,
    error: error.message || "Internal server error",
    ...(isDevelopment && {
      details: error.stack,
      timestamp: new Date().toISOString(),
    }),
  });
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required for analytics",
    });
  }
  next();
};

// GET /api/v1/analytics/dashboard-stats - Overall system metrics with real data (Optimized)
router.get("/dashboard-stats", verifyToken, requireAdmin, async (req, res) => {
  const endTimer = measureTime("Dashboard Stats Query");

  try {
    // Check cache first
    const cacheKey = getCacheKey("dashboard-stats");
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      console.log("� Serving dashboard stats from cache");
      endTimer();
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("�🔍 Analytics: Fetching real dashboard stats...");

    // Execute all queries in parallel for better performance
    const [partnersResult, usersResult, dealsResult, redemptionsResult] =
      await Promise.allSettled([
        supabase.from("partners").select("status", { count: "exact" }),
        supabase.from("users").select("role", { count: "exact" }),
        supabase.from("deals").select("status, end_date", { count: "exact" }),
        supabase
          .from("redemptions")
          .select("discount_amount, redeemed_at", { count: "exact" }),
      ]);

    // Handle any failed queries
    const errors = [];
    if (partnersResult.status === "rejected")
      errors.push(`Partners: ${partnersResult.reason.message}`);
    if (usersResult.status === "rejected")
      errors.push(`Users: ${usersResult.reason.message}`);
    if (dealsResult.status === "rejected")
      errors.push(`Deals: ${dealsResult.reason.message}`);
    if (redemptionsResult.status === "rejected")
      errors.push(`Redemptions: ${redemptionsResult.reason.message}`);

    if (errors.length > 0) {
      throw new Error(`Database query failures: ${errors.join(", ")}`);
    }

    // Process results safely
    const partners = partnersResult.value?.data || [];
    const users = usersResult.value?.data || [];
    const deals = dealsResult.value?.data || [];
    const redemptions = redemptionsResult.value?.data || [];

    // Calculate partner stats
    const partnerStats = {
      total: partners.length,
      approved: partners.filter((p) => p.status === "approved").length,
      pending: partners.filter((p) => p.status === "pending").length,
      rejected: partners.filter((p) => p.status === "rejected").length,
    };

    // Calculate user stats
    const userStats = {
      total: users.length,
      members: users.filter((u) => u.role === "member").length,
      partners: users.filter((u) => u.role === "partner").length,
      admins: users.filter((u) => u.role === "admin").length,
    };

    // Calculate deal stats with optimized date logic
    const now = new Date();
    const dealStats = {
      total: deals.length,
      active: deals.filter((d) => {
        const isActiveStatus =
          !d.status || d.status === "active" || d.status === "published";
        const notExpired = !d.end_date || new Date(d.end_date) > now;
        return isActiveStatus && notExpired;
      }).length,
      draft: deals.filter((d) => d.status === "draft").length,
      expired: deals.filter((d) => d.end_date && new Date(d.end_date) <= now)
        .length,
    };

    // Calculate activity stats with date filtering optimization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRedemptions = redemptions.filter(
      (r) => r.redeemed_at && new Date(r.redeemed_at) >= thirtyDaysAgo
    );

    const totalDiscountGiven = redemptions.reduce(
      (sum, r) => sum + (parseFloat(r.discount_amount) || 0),
      0
    );

    const activityStats = {
      totalRedemptions: redemptions.length,
      recentRedemptions: recentRedemptions.length,
      totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
    };

    const dashboardData = {
      partners: partnerStats,
      users: userStats,
      deals: dealStats,
      activity: activityStats,
      metadata: {
        lastUpdated: new Date().toISOString(),
        queryTime: endTimer(),
        recordCounts: {
          partners: partners.length,
          users: users.length,
          deals: deals.length,
          redemptions: redemptions.length,
        },
      },
    };

    // Cache the results
    setCache(cacheKey, dashboardData);

    console.log(`✅ Dashboard stats calculated successfully (${endTimer()}ms)`);

    res.json({
      success: true,
      data: dashboardData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    endTimer();
    sendError(res, error);
  }
});

// GET /api/v1/analytics/redemption-trends - Real redemption data grouped by date (Optimized)
router.get(
  "/redemption-trends",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const endTimer = measureTime("Redemption Trends Query");

    try {
      const {
        period = "7d",
        start_date: startDate,
        end_date: endDate,
      } = req.query;

      // Validate inputs
      validateDateRange(startDate, endDate);

      if (period && !["24h", "7d", "30d", "90d"].includes(period)) {
        return sendError(
          res,
          new Error("Invalid period. Use: 24h, 7d, 30d, or 90d"),
          400
        );
      }

      // Check cache
      const cacheKey = getCacheKey("redemption-trends", {
        period,
        startDate,
        endDate,
      });
      const cachedData = getFromCache(cacheKey);

      if (cachedData) {
        console.log("📦 Serving redemption trends from cache");
        endTimer();
        return res.json({
          success: true,
          data: cachedData.trends,
          summary: cachedData.summary,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }

      console.log(
        `🔍 Analytics: Fetching real redemption trends for period: ${period}`
      );

      // Calculate date range based on period with proper bounds
      let start = new Date();
      let end = new Date();

      if (startDate && endDate) {
        start = new Date(startDate + "T00:00:00.000Z");
        end = new Date(endDate + "T23:59:59.999Z");
      } else {
        end = new Date();
        start = new Date();

        switch (period) {
          case "24h":
            start.setHours(start.getHours() - 24);
            break;
          case "7d":
            start.setDate(start.getDate() - 7);
            break;
          case "30d":
            start.setDate(start.getDate() - 30);
            break;
          case "90d":
            start.setDate(start.getDate() - 90);
            break;
          default:
            start.setDate(start.getDate() - 7);
        }
      }

      // Optimized query with only necessary fields
      const { data: redemptions, error } = await supabase
        .from("redemptions")
        .select("redeemed_at, discount_amount, original_amount")
        .gte("redeemed_at", start.toISOString())
        .lte("redeemed_at", end.toISOString())
        .order("redeemed_at", { ascending: true });

      if (error) {
        console.error("Database error in redemption trends:", error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Optimized data processing with Map for better performance
      const trendData = new Map();
      let totalDiscountSum = 0;
      let totalOriginalSum = 0;

      (redemptions || []).forEach((redemption) => {
        const date = new Date(redemption.redeemed_at)
          .toISOString()
          .split("T")[0];
        const discountAmount = parseFloat(redemption.discount_amount) || 0;
        const originalAmount = parseFloat(redemption.original_amount) || 0;

        if (!trendData.has(date)) {
          trendData.set(date, {
            date,
            count: 0,
            totalDiscount: 0,
            totalOriginal: 0,
          });
        }

        const dayData = trendData.get(date);
        dayData.count++;
        dayData.totalDiscount += discountAmount;
        dayData.totalOriginal += originalAmount;

        totalDiscountSum += discountAmount;
        totalOriginalSum += originalAmount;
      });

      // Convert to array with optimized calculations
      const trends = Array.from(trendData.values())
        .map((day) => ({
          date: day.date,
          total_redemptions: day.count,
          total_discount: Math.round(day.totalDiscount * 100) / 100,
          total_original: Math.round(day.totalOriginal * 100) / 100,
          savingsPercentage:
            day.totalOriginal > 0
              ? Math.round((day.totalDiscount / day.totalOriginal) * 10000) /
                100
              : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate enhanced summary stats
      const totalRedemptions = redemptions?.length || 0;
      const avgDailyRedemptions =
        trends.length > 0
          ? Math.round((totalRedemptions / trends.length) * 100) / 100
          : 0;

      const summary = {
        totalRedemptions,
        totalDiscountGiven: Math.round(totalDiscountSum * 100) / 100,
        totalOriginalAmount: Math.round(totalOriginalSum * 100) / 100,
        avgDailyRedemptions,
        dateRange: {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
          days: trends.length,
        },
        overallSavingsRate:
          totalOriginalSum > 0
            ? Math.round((totalDiscountSum / totalOriginalSum) * 10000) / 100
            : 0,
      };

      const responseData = { trends, summary };

      // Cache the results
      setCache(cacheKey, responseData);

      console.log(
        `✅ Redemption trends calculated for ${totalRedemptions} redemptions (${endTimer()}ms)`
      );

      res.json({
        success: true,
        data: trends,
        summary,
        cached: false,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      endTimer();
      sendError(res, error);
    }
  }
);

// GET /api/v1/analytics/partner-performance - Real partner performance data (Optimized)
router.get(
  "/partner-performance",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const endTimer = measureTime("Partner Performance Query");

    try {
      // Input validation and pagination
      const {
        page = 1,
        limit = 50,
        sort_by = "performance_score",
        sort_order = "desc",
        status = "approved",
        category,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (parseInt(limit) > 100) {
        return sendError(res, new Error("Limit cannot exceed 100"), 400);
      }

      if (
        ![
          "performance_score",
          "total_redemptions",
          "total_savings",
          "business_name",
        ].includes(sort_by)
      ) {
        return sendError(res, new Error("Invalid sort_by parameter"), 400);
      }

      // Check cache
      const cacheKey = getCacheKey("partner-performance", {
        page,
        limit,
        sort_by,
        sort_order,
        status,
        category,
      });
      const cachedData = getFromCache(cacheKey);

      if (cachedData) {
        console.log("📦 Serving partner performance from cache");
        endTimer();
        return res.json({
          success: true,
          data: cachedData.data,
          summary: cachedData.summary,
          pagination: cachedData.pagination,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }

      console.log("🔍 Analytics: Fetching real partner performance data...");

      // Build optimized partner query
      let partnersQuery = supabase.from("partners").select(
        `
          id,
          brand_name,
          owner_name,
          email,
          business_type,
          city,
          status,
          created_at
        `,
        { count: "exact" }
      );

      if (status) {
        partnersQuery = partnersQuery.eq("status", status);
      }

      if (category) {
        partnersQuery = partnersQuery.eq("business_type", category);
      }

      const {
        data: partners,
        error: partnersError,
        count: totalPartners,
      } = await partnersQuery;

      if (partnersError) {
        throw new Error(`Partners query failed: ${partnersError.message}`);
      }

      if (!partners || partners.length === 0) {
        return res.json({
          success: true,
          data: [],
          summary: {
            totalPartners: 0,
            totalActiveDeals: 0,
            totalRedemptions: 0,
            totalSavingsProvided: 0,
          },
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
          message: "No partners found with specified criteria",
          timestamp: new Date().toISOString(),
        });
      }

      const partnerIds = partners.map((p) => p.id);

      // Execute deals and redemptions queries in parallel for better performance
      const [dealsResult, redemptionsResult] = await Promise.allSettled([
        supabase
          .from("deals")
          .select("partner_id, status, end_date")
          .in("partner_id", partnerIds),
        supabase
          .from("redemptions")
          .select("partner_id, discount_amount, original_amount, final_amount")
          .in("partner_id", partnerIds),
      ]);

      if (dealsResult.status === "rejected") {
        throw new Error(`Deals query failed: ${dealsResult.reason.message}`);
      }
      if (redemptionsResult.status === "rejected") {
        throw new Error(
          `Redemptions query failed: ${redemptionsResult.reason.message}`
        );
      }

      const dealsData = dealsResult.value?.data || [];
      const redemptionsData = redemptionsResult.value?.data || [];

      // Create lookup maps for better performance
      const dealsMap = new Map();
      const redemptionsMap = new Map();
      const now = new Date();

      // Process deals data
      dealsData.forEach((deal) => {
        if (!dealsMap.has(deal.partner_id)) {
          dealsMap.set(deal.partner_id, { total: 0, active: 0 });
        }
        const stats = dealsMap.get(deal.partner_id);
        stats.total++;

        const isActive =
          deal.status === "active" &&
          (!deal.end_date || new Date(deal.end_date) > now);
        if (isActive) {
          stats.active++;
        }
      });

      // Process redemptions data
      redemptionsData.forEach((redemption) => {
        if (!redemptionsMap.has(redemption.partner_id)) {
          redemptionsMap.set(redemption.partner_id, {
            count: 0,
            totalSavings: 0,
            totalRevenue: 0,
          });
        }
        const stats = redemptionsMap.get(redemption.partner_id);
        stats.count++;
        stats.totalSavings += parseFloat(redemption.discount_amount) || 0;
        stats.totalRevenue += parseFloat(redemption.final_amount) || 0;
      });

      // Process partner performance data with optimized calculations
      const partnerPerformance = partners.map((partner) => {
        const dealStats = dealsMap.get(partner.id) || { total: 0, active: 0 };
        const redemptionStats = redemptionsMap.get(partner.id) || {
          count: 0,
          totalSavings: 0,
          totalRevenue: 0,
        };

        // Enhanced performance score calculation
        const performanceScore =
          redemptionStats.count > 0
            ? Math.min(
                100,
                Math.round(
                  (redemptionStats.count / Math.max(1, dealStats.active)) * 10
                )
              )
            : 0;

        return {
          id: partner.id,
          business_name: partner.brand_name,
          owner_name: partner.owner_name,
          contact_email: partner.email,
          category: partner.business_type || "Other",
          city: partner.city || "N/A",
          total_deals: dealStats.total,
          active_deals: dealStats.active,
          total_redemptions: redemptionStats.count,
          total_savings: Math.round(redemptionStats.totalSavings * 100) / 100,
          total_revenue: Math.round(redemptionStats.totalRevenue * 100) / 100,
          performance_score: performanceScore,
          member_since: partner.created_at,
          status: partner.status,
          engagement_rate:
            dealStats.total > 0
              ? Math.round((redemptionStats.count / dealStats.total) * 100) /
                100
              : 0,
        };
      });

      // Optimized sorting
      partnerPerformance.sort((a, b) => {
        const multiplier = sort_order === "desc" ? -1 : 1;
        if (typeof a[sort_by] === "string") {
          return multiplier * a[sort_by].localeCompare(b[sort_by]);
        }
        return multiplier * (b[sort_by] - a[sort_by]);
      });

      // Apply pagination
      const paginatedData = partnerPerformance.slice(
        offset,
        offset + parseInt(limit)
      );

      // Calculate enhanced summary stats
      const summary = {
        totalPartners: totalPartners || partners.length,
        totalActiveDeals: partnerPerformance.reduce(
          (sum, p) => sum + p.active_deals,
          0
        ),
        totalRedemptions: partnerPerformance.reduce(
          (sum, p) => sum + p.total_redemptions,
          0
        ),
        totalSavingsProvided:
          Math.round(
            partnerPerformance.reduce((sum, p) => sum + p.total_savings, 0) *
              100
          ) / 100,
        avgPerformanceScore:
          Math.round(
            (partnerPerformance.reduce(
              (sum, p) => sum + p.performance_score,
              0
            ) /
              partnerPerformance.length) *
              100
          ) / 100,
        topPerformer:
          partnerPerformance.length > 0
            ? {
                name: partnerPerformance[0].business_name,
                score: partnerPerformance[0].performance_score,
                redemptions: partnerPerformance[0].total_redemptions,
              }
            : null,
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPartners || partners.length,
        totalPages: Math.ceil(
          (totalPartners || partners.length) / parseInt(limit)
        ),
        hasNext: offset + parseInt(limit) < (totalPartners || partners.length),
        hasPrev: parseInt(page) > 1,
      };

      const responseData = {
        data: paginatedData,
        summary,
        pagination,
      };

      // Cache the results
      setCache(cacheKey, responseData);

      console.log(
        `✅ Partner performance calculated for ${
          partners.length
        } partners (${endTimer()}ms)`
      );

      res.json({
        success: true,
        ...responseData,
        cached: false,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      endTimer();
      sendError(res, error);
    }
  }
);

// Cache cleanup utility - runs every 10 minutes
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `🧹 Cleaned ${cleanedCount} expired cache entries. Cache size: ${cache.size}`
    );
  }
}, 10 * 60 * 1000);

// Health check endpoint for analytics
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Analytics API",
    timestamp: new Date().toISOString(),
    cache: {
      size: cache.size,
      maxAge: `${CACHE_DURATION / 1000}s`,
    },
    endpoints: [
      "/dashboard-stats",
      "/redemption-trends",
      "/partner-performance",
    ],
  });
});

module.exports = router;
