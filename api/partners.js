const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gosave-gamma.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    // Get all approved partners
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

    res.status(200).json({
      success: true,
      partners: partners || [],
      count: partners?.length || 0,
    });
  } catch (error) {
    console.error("Partners fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
