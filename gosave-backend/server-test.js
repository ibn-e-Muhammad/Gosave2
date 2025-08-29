const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());

// Basic health check route
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "GoSave API is running!",
    timestamp: new Date().toISOString(),
    environment: "development",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GoSave API server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);
});
