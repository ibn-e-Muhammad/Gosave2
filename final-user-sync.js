// Final script to sync database with auth user IDs
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

// New auth user IDs from the latest creation
const authUserMappings = [
  {
    email: 'admin@gosave.pk',
    authId: 'f28e4766-0062-4303-9dce-159a29ddc128',
    oldDbId: '550e8400-e29b-41d4-a716-446655440010'
  },
  {
    email: 'fatima.khan@gmail.com',
    authId: 'b7fdbb69-b1f4-4cad-a776-cede4e9ff3c7',
    oldDbId: '550e8400-e29b-41d4-a716-446655440011'
  },
  {
    email: 'hassan.raza@gmail.com',
    authId: '17084d63-1180-4984-8156-ca41b7a00591',
    oldDbId: '550e8400-e29b-41d4-a716-446655440014'
  },
  {
    email: 'zainab.ali@gmail.com',
    authId: '626db9fc-7daa-42b0-bad4-fde596b37cfe',
    oldDbId: '550e8400-e29b-41d4-a716-446655440017'
  },
  {
    email: 'ali.ahmed@outlook.com',
    authId: 'd3e83130-e512-4457-826f-4f1f63f1037c',
    oldDbId: '550e8400-e29b-41d4-a716-446655440012'
  }
];

async function finalUserSync() {
  console.log('🔄 Final User ID Synchronization\n');
  console.log('This will update the database to match auth user IDs\n');

  for (const mapping of authUserMappings) {
    console.log(`Syncing ${mapping.email}:`);
    console.log(`  Auth ID: ${mapping.authId}`);
    console.log(`  Old DB ID: ${mapping.oldDbId}`);

    try {
      // Step 1: Update payments table first (if any exist)
      const { data: paymentsUpdate, error: paymentsError } = await supabase
        .from('payments')
        .update({ user_id: mapping.authId })
        .eq('user_id', mapping.oldDbId)
        .select();

      if (paymentsError) {
        console.error(`  ❌ Failed to update payments:`, paymentsError.message);
        continue;
      } else {
        console.log(`  💳 Updated ${paymentsUpdate?.length || 0} payment records`);
      }

      // Step 2: Update users table
      const { data: userUpdate, error: userError } = await supabase
        .from('users')
        .update({ id: mapping.authId })
        .eq('id', mapping.oldDbId)
        .select();

      if (userError) {
        console.error(`  ❌ Failed to update user:`, userError.message);
      } else if (userUpdate && userUpdate.length > 0) {
        console.log(`  ✅ Successfully updated user record`);
      } else {
        console.log(`  ⚠️  No user found with old ID`);
      }

    } catch (error) {
      console.error(`  ❌ Unexpected error:`, error.message);
    }

    console.log('');
  }

  // Final verification
  console.log('🔍 Final Verification...');
  
  for (const mapping of authUserMappings) {
    try {
      // Check if user exists in database with auth ID
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          id, 
          email, 
          full_name, 
          role, 
          membership_id,
          memberships (name)
        `)
        .eq('id', mapping.authId)
        .single();

      if (userError) {
        console.error(`❌ ${mapping.email}: Database user not found`);
      } else {
        console.log(`✅ ${mapping.email}:`);
        console.log(`    Database ID: ${user.id}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Membership: ${user.memberships?.name || 'None'}`);
      }

      // Check if auth user exists
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError) {
        const authUser = authUsers.users.find(u => u.id === mapping.authId);
        if (authUser) {
          console.log(`    Auth ID: ${authUser.id} ✅`);
        } else {
          console.log(`    Auth ID: Not found ❌`);
        }
      }

    } catch (error) {
      console.error(`❌ Error verifying ${mapping.email}:`, error.message);
    }
  }

  console.log('\n🎯 User synchronization completed!');
  console.log('\n🔑 Ready to Test - Credentials:');
  authUserMappings.forEach(mapping => {
    console.log(`   ${mapping.email} / password (admin123, member123, or viewer123)`);
  });
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run the authentication test script');
  console.log('2. Test frontend login');
  console.log('3. Verify protected routes work correctly');
}

finalUserSync().catch(console.error);
