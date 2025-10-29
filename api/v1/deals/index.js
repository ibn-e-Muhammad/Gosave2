const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://gosave-gamma.vercel.app");
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
      error: "Method not allowed"
    });
  }

  try {
    // Get all deals with partner information
    const { data: deals, error } = await supabase
      .from("deals")
      .select(`
        *,
        partners (
          id,
          business_name,
          logo_url,
          category
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch deals",
      });
    }

    // Transform the data to match frontend expectations
    const transformedDeals = deals.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      discount_percentage: deal.discount_percentage,
      original_price: deal.original_price,
      discounted_price: deal.discounted_price,
      category: deal.category,
      status: deal.status,
      expiry_date: deal.expiry_date,
      terms_conditions: deal.terms_conditions,
      usage_limit: deal.usage_limit,
      used_count: deal.used_count,
      created_at: deal.created_at,
      partner: deal.partners ? {
        id: deal.partners.id,
        business_name: deal.partners.business_name,
        logo_url: deal.partners.logo_url,
        category: deal.partners.category
      } : null
    }));

    res.status(200).json({
      success: true,
      deals: transformedDeals,
      count: transformedDeals.length
    });

  } catch (error) {
    console.error("Deals fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};