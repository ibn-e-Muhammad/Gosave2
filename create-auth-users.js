// Script to create authentication users in Supabase Auth
// This script uses the service role key to create users programmatically

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./gosave-backend/.env" });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error(
    "   SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey ? "✅" : "❌"
  );
  console.error("\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file");
  console.error(
    "You can find it in Supabase Dashboard > Settings > API > service_role key"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Users to create with their specific UUIDs from our database
const usersToCreate = [
  {
    email: "admin@gosave.pk",
    password: "admin123",
    user_id: "550e8400-e29b-41d4-a716-446655440010",
    full_name: "Ahmad Hassan",
    role: "admin",
  },
  {
    email: "fatima.khan@gmail.com",
    password: "member123",
    user_id: "550e8400-e29b-41d4-a716-446655440011",
    full_name: "Fatima Khan",
    role: "member (premium)",
  },
  {
    email: "hassan.raza@gmail.com",
    password: "member123",
    user_id: "550e8400-e29b-41d4-a716-446655440014",
    full_name: "Hassan Raza",
    role: "member (basic)",
  },
  {
    email: "zainab.ali@gmail.com",
    password: "viewer123",
    user_id: "550e8400-e29b-41d4-a716-446655440017",
    full_name: "Zainab Ali",
    role: "viewer",
  },
  {
    email: "ali.ahmed@outlook.com",
    password: "member123",
    user_id: "550e8400-e29b-41d4-a716-446655440012",
    full_name: "Ali Ahmed",
    role: "member (premium)",
  },
];

async function createAuthUsers() {
  console.log("🔐 Creating GoSave Authentication Users\n");

  for (const user of usersToCreate) {
    try {
      console.log(`Creating user: ${user.email} (${user.role})`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
        email_confirm: true, // Skip email confirmation
        user_id: user.user_id, // Use our specific UUID
      });

      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message);

        // Check if user already exists
        if (error.message.includes("already registered")) {
          console.log(`   ℹ️  User ${user.email} already exists in auth.users`);
        }
      } else {
        console.log(`✅ Successfully created: ${user.email}`);
        console.log(`   User ID: ${data.user.id}`);
        console.log(
          `   Email confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`
        );
      }

      console.log(""); // Empty line for readability
    } catch (error) {
      console.error(
        `❌ Unexpected error creating ${user.email}:`,
        error.message
      );
    }
  }

  console.log("🎯 Auth user creation completed!\n");

  // Verify users were created
  console.log("🔍 Verifying created users...");
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Failed to list users:", error.message);
    } else {
      console.log(`✅ Total auth users: ${users.users.length}`);

      usersToCreate.forEach((user) => {
        const authUser = users.users.find((u) => u.email === user.email);
        if (authUser) {
          console.log(`   ✅ ${user.email} - ID: ${authUser.id}`);
        } else {
          console.log(`   ❌ ${user.email} - Not found`);
        }
      });
    }
  } catch (error) {
    console.error("❌ Error verifying users:", error.message);
  }

  console.log("\n📝 Next Steps:");
  console.log("1. Test login with any of the created users");
  console.log("2. Verify that user profiles are fetched correctly");
  console.log("3. Test role-based access and membership filtering");
  console.log("\n🔑 Test Credentials:");
  console.log("   Admin: admin@gosave.pk / admin123");
  console.log("   Premium Member: fatima.khan@gmail.com / member123");
  console.log("   Basic Member: hassan.raza@gmail.com / member123");
  console.log("   Viewer: zainab.ali@gmail.com / viewer123");
}

// Run the script
createAuthUsers().catch(console.error);
