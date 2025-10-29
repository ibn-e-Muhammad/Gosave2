const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Import the existing server setup but modify for Vercel
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      process.env.FRONTEND_URL_ALT || "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Import the existing routes
const apiRoutes = require("./routes/api/v1");

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "GoSave API is running on Vercel!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
  });
});

// API routes
app.use("/api/v1", apiRoutes);

// 404 handler
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

// Export for Vercel
module.exports = app;