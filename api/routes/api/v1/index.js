const express = require("express");
const router = express.Router();

// Import route modules
const dealsRoutes = require("./deals");
const partnersRoutes = require("./partners");
const authRoutes = require("./auth");
const authEnhancedRoutes = require("./auth-enhanced");
const adminUsersRoutes = require("./admin/users");
const analyticsRoutes = require("./analytics");

// Use route modules
router.use("/deals", dealsRoutes);
router.use("/partners", partnersRoutes);
router.use("/auth", authRoutes);
router.use("/auth-enhanced", authEnhancedRoutes);
router.use("/admin/users", adminUsersRoutes);
router.use("/analytics", analyticsRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "GoSave API v1",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      deals: "/deals",
      partners: "/partners",
      auth: "/auth",
      "auth-enhanced": "/auth-enhanced (development email verification)",
      admin: {
        users: "/admin/users",
      },
      debug: "/debug",
      analytics: "/analytics",
    },
  });
});

module.exports = router;
