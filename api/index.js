// GoSave API Index - Vercel Serverless Function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gosave-gamma.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // API Root endpoint
  if (req.url === "/api" || req.url === "/api/" || req.url === "/") {
    return res.status(200).json({
      message: "🎉 GoSave API is running on Vercel!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      version: "1.0.0",
      status: "healthy",
      endpoints: {
        health: "/api/health",
        auth: {
          register: "/api/register",
          login: "/api/login"
        },
        deals: "/api/deals",
        partners: "/api/partners"
      },
      cors: {
        origin: "https://gosave-gamma.vercel.app",
        credentials: true,
      },
    });
  }

  // Health check endpoint
  if (req.url === "/api/health") {
    return res.status(200).json({
      message: "GoSave API Health Check - OK!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  }

  // Default 404 response
  res.status(404).json({
    error: "API endpoint not found",
    path: req.url,
    message: "Please check the available endpoints at /api",
    available_endpoints: [
      "/api",
      "/api/health",
      "/api/register",
      "/api/login",
      "/api/deals",
      "/api/partners",
    ],
  });
};
