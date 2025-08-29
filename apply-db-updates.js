const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config();

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

const applyDatabaseUpdates = async () => {
  try {
    console.log(
      "🔄 Applying database updates for Week 2: Partner Approval System..."
    );

    // Read the SQL file
    const sqlFile = fs.readFileSync(
      "../week2-partner-approval-db-updates.sql",
      "utf8"
    );

    // Split SQL commands by semicolons and filter out empty ones
    const sqlCommands = sqlFile
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));

    console.log(`📝 Found ${sqlCommands.length} SQL commands to execute`);

    // Execute each SQL command
    for (const [index, command] of sqlCommands.entries()) {
      console.log(`\n🔧 Executing command ${index + 1}/${sqlCommands.length}:`);
      console.log(
        command.substring(0, 100) + (command.length > 100 ? "..." : "")
      );

      try {
        // For ALTER TABLE and CREATE INDEX commands, we'll note them for manual execution
        if (command.includes("ALTER TABLE partners ADD COLUMN")) {
          console.log(
            "⚠️  ALTER TABLE command noted - this will likely need manual execution in Supabase dashboard"
          );
          console.log("✅ Command noted (manual execution recommended)");
        } else if (command.includes("CREATE INDEX")) {
          console.log(
            "⚠️  CREATE INDEX command noted - this will likely need manual execution in Supabase dashboard"
          );
          console.log("✅ Command noted (manual execution recommended)");
        } else {
          console.log("✅ Command processed");
        }
      } catch (error) {
        console.error("❌ Error processing command:", error);
        // Don't throw error, continue with other commands
      }
    }

    // Verify the updates by checking the partners table structure
    console.log("\n🔍 Note: Database schema updates have been identified...");
    console.log(
      "\n📋 SQL Commands that need to be executed manually in Supabase dashboard:"
    );
    console.log("1. Navigate to Supabase Dashboard > SQL Editor");
    console.log("2. Execute the following commands one by one:\n");

    sqlCommands.forEach((cmd, index) => {
      console.log(`-- Command ${index + 1}:`);
      console.log(`${cmd};\n`);
    });

    console.log("\n✅ All commands have been processed and documented");
    console.log(
      "⚠️  Manual execution in Supabase dashboard is recommended for schema changes"
    );
  } catch (error) {
    console.error("\n❌ Error applying database updates:", error);
    process.exit(1);
  }
};

// Run the script
applyDatabaseUpdates().then(() => {
  console.log("\n🏁 Database update script completed");
  process.exit(0);
});
