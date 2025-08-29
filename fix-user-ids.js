// Script to update database user IDs to match Supabase Auth user IDs
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

// Mapping of emails to new auth user IDs (from the previous script output)
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

async function fixUserIds() {
  console.log('🔧 Fixing User ID Mappings Between Auth and Database\n');

  for (const mapping of userIdMappings) {
    console.log(`Updating ${mapping.email}:`);
    console.log(`  Old ID: ${mapping.oldId}`);
    console.log(`  New ID: ${mapping.newId}`);

    try {
      // Update the user ID in the users table
      const { data, error } = await supabase
        .from('users')
        .update({ id: mapping.newId })
        .eq('id', mapping.oldId)
        .select();

      if (error) {
        console.error(`  ❌ Failed to update user:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`  ✅ Successfully updated user ID`);
      } else {
        console.log(`  ⚠️  No user found with old ID`);
      }

    } catch (error) {
      console.error(`  ❌ Unexpected error:`, error.message);
    }

    console.log('');
  }

  // Verify the updates
  console.log('🔍 Verifying user ID updates...');
  
  for (const mapping of userIdMappings) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('email', mapping.email)
        .single();

      if (error) {
        console.error(`❌ Error fetching ${mapping.email}:`, error.message);
      } else if (user) {
        if (user.id === mapping.newId) {
          console.log(`✅ ${mapping.email} - ID correctly updated`);
        } else {
          console.log(`❌ ${mapping.email} - ID mismatch: ${user.id}`);
        }
      } else {
        console.log(`❌ ${mapping.email} - User not found`);
      }
    } catch (error) {
      console.error(`❌ Error verifying ${mapping.email}:`, error.message);
    }
  }

  console.log('\n🎯 User ID fix completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Test authentication with the updated user IDs');
  console.log('2. Verify that login returns correct user profiles');
  console.log('3. Test protected endpoints with the new tokens');
}

fixUserIds().catch(console.error);
