// Simple test endpoint for debugging body parsing
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gosave-gamma.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  // Check if body needs to be parsed
  let parsedBody;

  if (typeof req.body === "string") {
    try {
      parsedBody = JSON.parse(req.body);
    } catch (e) {
      parsedBody = { error: "Failed to parse body", raw: req.body };
    }
  } else {
    parsedBody = req.body;
  }

  return res.status(200).json({
    success: true,
    message: "Debug endpoint working",
    bodyType: typeof req.body,
    bodyContent: req.body,
    parsedBody: parsedBody,
    contentType: req.headers["content-type"],
    allHeaders: req.headers,
  });
};
