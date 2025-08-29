// Complete script to fix user ID mappings with foreign key handling
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './gosave-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mapping of emails to new auth user IDs
const userIdMappings = [
  {
    email: 'admin@gosave.pk',
    oldId: '550e8400-e29b-41d4-a716-446655440010',
    newId: '29b5bea9-3965-46e1-93e4-827ec39860c4'
  },
  {
    email: 'fatima.khan@gmail.com',
    oldId: '550e8400-e29b-41d4-a716-446655440011',
    newId: '7c05fc56-4fc2-4430-a174-3bc6e5bf3285'
  },
  {
    email: 'hassan.raza@gmail.com',
    oldId: '550e8400-e29b-41d4-a716-446655440014',
    newId: '1691d9d4-6e50-4f98-8e62-4be673567829'
  },
  {
    email: 'zainab.ali@gmail.com',
    oldId: '550e8400-e29b-41d4-a716-446655440017',
    newId: '03da7bf9-3c39-41a4-8b8a-250158ef4a15'
  },
  {
    email: 'ali.ahmed@outlook.com',
    oldId: '550e8400-e29b-41d4-a716-446655440012',
    newId: '1ea1e9fd-582f-4376-9ffb-7ba72a9366a0'
  }
];

async function fixUserIdsComplete() {
  console.log('🔧 Complete User ID Fix with Foreign Key Handling\n');

  for (const mapping of userIdMappings) {
    console.log(`Processing ${mapping.email}:`);
    console.log(`  Old ID: ${mapping.oldId}`);
    console.log(`  New ID: ${mapping.newId}`);

    try {
      // Step 1: Update payments table first
      console.log('  📝 Updating payments table...');
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .update({ user_id: mapping.newId })
        .eq('user_id', mapping.oldId)
        .select();

      if (paymentsError) {
        console.error(`    ❌ Failed to update payments:`, paymentsError.message);
        continue;
      } else {
        console.log(`    ✅ Updated ${paymentsData?.length || 0} payment records`);
      }

      // Step 2: Update users table
      console.log('  👤 Updating users table...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({ id: mapping.newId })
        .eq('id', mapping.oldId)
        .select();

      if (userError) {
        console.error(`    ❌ Failed to update user:`, userError.message);
      } else if (userData && userData.length > 0) {
        console.log(`    ✅ Successfully updated user ID`);
      } else {
        console.log(`    ⚠️  No user found with old ID`);
      }

    } catch (error) {
      console.error(`  ❌ Unexpected error:`, error.message);
    }

    console.log('');
  }

  // Verify the updates
  console.log('🔍 Verifying complete user ID updates...');
  
  for (const mapping of userIdMappings) {
    try {
      // Check user table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, membership_id')
        .eq('email', mapping.email)
        .single();

      if (userError) {
        console.error(`❌ Error fetching user ${mapping.email}:`, userError.message);
        continue;
      }

      // Check payments table
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, user_id')
        .eq('user_id', mapping.newId);

      if (paymentsError) {
        console.error(`❌ Error fetching payments for ${mapping.email}:`, paymentsError.message);
      }

      if (user && user.id === mapping.newId) {
        console.log(`✅ ${mapping.email}:`);
        console.log(`    User ID: ${user.id}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Payments: ${payments?.length || 0} records`);
      } else {
        console.log(`❌ ${mapping.email} - ID mismatch or not found`);
      }

    } catch (error) {
      console.error(`❌ Error verifying ${mapping.email}:`, error.message);
    }
  }

  console.log('\n🎯 Complete user ID fix finished!');
  console.log('\n📝 Ready for Testing:');
  console.log('   All user IDs should now match between auth.users and users tables');
  console.log('   Payment records have been updated to maintain referential integrity');
  console.log('   Authentication system should work correctly');
}

fixUserIdsComplete().catch(console.error);
