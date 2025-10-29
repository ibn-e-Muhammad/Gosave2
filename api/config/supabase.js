const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("memberships")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection error:", error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection,
};
