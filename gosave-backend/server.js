const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Supabase configuration and test connection
const { testConnection } = require("./config/supabase");

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Serve static files for testing
app.use("/test", express.static(path.join(__dirname, "public")));

// Basic health check route (define before other routes)
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "GoSave API is running!",
    timestamp: new Date().toISOString(),
    environment: "development",
  });
});

// Import routes
const apiRoutes = require("./routes/api/v1");

// Routes
app.use("/api/v1", apiRoutes);

// 404 handler - Express v5 compatible
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 GoSave API server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);

  // Test Supabase connection on startup
  console.log("\n🔍 Testing Supabase connection...");
  await testConnection();
});
