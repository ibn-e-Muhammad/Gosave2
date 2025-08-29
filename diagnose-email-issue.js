// Comprehensive email verification diagnosis script
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./gosave-backend/.env" });

console.log("🔧 Loading environment variables...");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Present" : "Missing");
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Missing"
);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseEmailIssue() {
  console.log("🔍 Diagnosing GoSave Email Verification Issue\n");
  console.log("=".repeat(60));

  // Test 1: Check Supabase connection
  console.log("\n1️⃣  Testing Supabase Connection...");
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (error) {
      console.log("❌ Supabase connection failed:", error.message);
      return;
    }
    console.log("✅ Supabase connection successful");
  } catch (error) {
    console.log("❌ Supabase connection error:", error.message);
    return;
  }

  // Test 2: Check auth configuration
  console.log("\n2️⃣  Testing Auth Configuration...");
  try {
    // Try to get auth settings (this will show if auth is properly configured)
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers();
    if (authError) {
      console.log("❌ Auth admin access failed:", authError.message);
      console.log(
        "🔧 Check if SUPABASE_SERVICE_ROLE_KEY has admin permissions"
      );
    } else {
      console.log("✅ Auth admin access working");
      console.log(`📊 Total auth users: ${authData.users.length}`);
    }
  } catch (error) {
    console.log("❌ Auth configuration error:", error.message);
  }

  // Test 3: Test email link generation
  console.log("\n3️⃣  Testing Email Link Generation...");
  const testEmail = `diagnosis${Date.now()}@example.com`;

  try {
    // First create a test user
    const { data: createData, error: createError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: "TestPass123",
        email_confirm: false,
      });

    if (createError) {
      console.log("❌ Test user creation failed:", createError.message);
    } else {
      console.log("✅ Test user created successfully");

      // Now try to generate verification link
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "signup",
          email: testEmail,
        });

      if (linkError) {
        console.log("❌ Link generation failed:", linkError.message);
        console.log("🔧 This indicates email service configuration issue");
      } else {
        console.log("✅ Verification link generated successfully");
        console.log("🔗 Verification link:", linkData?.properties?.action_link);
        console.log("📧 Email would be sent to:", linkData?.properties?.email);
        console.log("📝 Link type:", linkData?.properties?.type);

        if (linkData?.properties?.action_link) {
          console.log(
            "\n🎯 DIAGNOSIS: Link generation works - email delivery is the issue"
          );
        }
      }

      // Clean up test user
      try {
        await supabase.auth.admin.deleteUser(createData.user.id);
        console.log("🧹 Test user cleaned up");
      } catch (cleanupError) {
        console.log("⚠️  Test user cleanup failed:", cleanupError.message);
      }
    }
  } catch (error) {
    console.log("❌ Email link generation test failed:", error.message);
  }

  // Test 4: Check project settings
  console.log("\n4️⃣  Checking Project Configuration...");
  console.log("📋 Supabase URL:", supabaseUrl);
  console.log(
    "🔑 Service Role Key:",
    supabaseServiceKey ? "Present" : "Missing"
  );

  // Test 5: Provide diagnosis summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DIAGNOSIS SUMMARY");
  console.log("=".repeat(60));

  console.log("\n🔍 Most Likely Causes:");
  console.log("1. 📧 Email templates not configured in Supabase Dashboard");
  console.log("2. 🚫 Email confirmation disabled in Auth settings");
  console.log("3. 📮 SMTP not configured (using default Supabase email)");
  console.log("4. 🏗️  Development mode limitations");

  console.log("\n🔧 Required Checks:");
  console.log("1. Supabase Dashboard → Authentication → Settings");
  console.log('2. Check "Enable email confirmations" setting');
  console.log("3. Authentication → Email Templates → Confirm signup");
  console.log("4. Check if custom SMTP is needed");

  console.log("\n📝 Next Steps:");
  console.log("1. Check Supabase Dashboard email settings");
  console.log("2. Implement console link logging workaround");
  console.log("3. Create admin verification endpoint");
  console.log("4. Configure production email delivery");
}

// Run diagnosis
diagnoseEmailIssue().catch(console.error);
