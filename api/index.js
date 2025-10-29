// Simple Vercel serverless function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Simple routing
  if (req.url === "/api" || req.url === "/api/") {
    return res.status(200).json({
      message: "GoSave API is running on Vercel!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      endpoints: [
        "/api/v1/health",
        "/api/v1/auth",
        "/api/v1/deals",
        "/api/v1/partners",
      ],
    });
  }

  if (req.url === "/api/v1/health") {
    return res.status(200).json({
      message: "GoSave API Health Check - OK!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      status: "healthy",
    });
  }

  // Default response
  res.status(404).json({
    error: "API endpoint not found",
    path: req.url,
  });
};
