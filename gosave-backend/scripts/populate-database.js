require("dotenv").config();
const { supabase } = require("../config/supabase");

async function populateDatabase() {
  console.log("🚀 Starting database population...\n");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await supabase
      .from("payments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("deals")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("partners")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("users")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("memberships")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("✅ Existing data cleared\n");

    // 1. Insert memberships
    console.log("📋 Inserting memberships...");
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert([
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "basic",
          price: 2999,
          duration_months: 12,
          description:
            "Basic membership with access to standard deals and discounts",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          name: "premium",
          price: 4999,
          duration_months: 12,
          description:
            "Premium membership with access to exclusive deals, higher discounts, and priority support",
        },
      ]);

    if (membershipError) throw membershipError;
    console.log("✅ Memberships inserted\n");

    // 2. Insert users
    console.log("👥 Inserting users...");
    const { error: usersError } = await supabase.from("users").insert([
      // Admin
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        email: "admin@gosave.pk",
        full_name: "Ahmad Hassan",
        role: "admin",
        membership_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "active",
        membership_valid_until: "2025-12-31",
      },
      // Premium members
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        email: "fatima.khan@gmail.com",
        full_name: "Fatima Khan",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "active",
        membership_valid_until: "2025-11-15",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440012",
        email: "ali.ahmed@outlook.com",
        full_name: "Ali Ahmed",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "active",
        membership_valid_until: "2025-10-20",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440013",
        email: "sara.malik@yahoo.com",
        full_name: "Sara Malik",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "active",
        membership_valid_until: "2025-12-05",
      },
      // Basic members
      {
        id: "550e8400-e29b-41d4-a716-446655440014",
        email: "hassan.raza@gmail.com",
        full_name: "Hassan Raza",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440001",
        status: "active",
        membership_valid_until: "2025-09-30",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440015",
        email: "ayesha.shah@hotmail.com",
        full_name: "Ayesha Shah",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440001",
        status: "active",
        membership_valid_until: "2025-11-10",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440016",
        email: "usman.tariq@gmail.com",
        full_name: "Usman Tariq",
        role: "member",
        membership_id: "550e8400-e29b-41d4-a716-446655440001",
        status: "active",
        membership_valid_until: "2025-08-25",
      },
      // Viewers
      {
        id: "550e8400-e29b-41d4-a716-446655440017",
        email: "zainab.ali@gmail.com",
        full_name: "Zainab Ali",
        role: "viewer",
        membership_id: null,
        status: "active",
        membership_valid_until: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440018",
        email: "omar.sheikh@yahoo.com",
        full_name: "Omar Sheikh",
        role: "viewer",
        membership_id: null,
        status: "active",
        membership_valid_until: null,
      },
    ]);

    if (usersError) throw usersError;
    console.log("✅ Users inserted\n");

    // 3. Insert partners
    console.log("🏪 Inserting partners...");
    const { error: partnersError } = await supabase.from("partners").insert([
      {
        id: "550e8400-e29b-41d4-a716-446655440020",
        brand_name: "Chai Wala Corner",
        owner_name: "Rashid Ali",
        email: "chaiwala@example.com",
        phone: "+92-300-1234567",
        website: "www.chaiwalacorner.pk",
        min_discount: 10,
        max_discount: 25,
        business_type: "Food & Drink",
        address: "G-9 Markaz",
        city: "Islamabad",
        contract_duration_months: 12,
        status: "approved",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440021",
        brand_name: "Karachi Biryani House",
        owner_name: "Muhammad Saleem",
        email: "kbiryani@example.com",
        phone: "+92-321-9876543",
        website: "www.karachibiryani.pk",
        min_discount: 15,
        max_discount: 30,
        business_type: "Food & Drink",
        address: "Gulshan-e-Iqbal",
        city: "Karachi",
        contract_duration_months: 12,
        status: "approved",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440022",
        brand_name: "Lahori Kulfi Corner",
        owner_name: "Amjad Hussain",
        email: "kulfi@example.com",
        phone: "+92-300-5555555",
        website: null,
        min_discount: 8,
        max_discount: 20,
        business_type: "Food & Drink",
        address: "Liberty Market",
        city: "Lahore",
        contract_duration_months: 6,
        status: "approved",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440023",
        brand_name: "Stitch & Style",
        owner_name: "Ayesha Khan",
        email: "stitchstyle@example.com",
        phone: "+92-333-7777777",
        website: "www.stitchstyle.pk",
        min_discount: 15,
        max_discount: 40,
        business_type: "Clothing",
        address: "Liberty Market",
        city: "Lahore",
        contract_duration_months: 12,
        status: "approved",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440024",
        brand_name: "Desi Threads",
        owner_name: "Farah Noor",
        email: "desithreads@example.com",
        phone: "+92-345-8888888",
        website: "www.desithreads.com",
        min_discount: 20,
        max_discount: 50,
        business_type: "Clothing",
        address: "Zamzama Street",
        city: "Karachi",
        contract_duration_months: 12,
        status: "approved",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440025",
        brand_name: "ByteFix Labs",
        owner_name: "Umair Raza",
        email: "bytefix@example.com",
        phone: "+92-300-9999999",
        website: "www.bytefixlabs.pk",
        min_discount: 5,
        max_discount: 25,
        business_type: "Electronics",
        address: "Saddar",
        city: "Karachi",
        contract_duration_months: 12,
        status: "approved",
      },
    ]);

    if (partnersError) throw partnersError;
    console.log("✅ Partners inserted\n");

    console.log("🎯 Database population completed successfully!");
    console.log("\n📊 Summary:");
    console.log("- 2 membership plans");
    console.log("- 9 users (1 admin, 6 members, 2 viewers)");
    console.log("- 6 approved partners");
    console.log("- Ready for deals and payments data");
  } catch (error) {
    console.error("❌ Error populating database:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };
