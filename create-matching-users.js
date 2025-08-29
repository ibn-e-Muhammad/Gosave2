// Script to create user records in database matching auth user IDs
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

// User data with auth IDs
const usersToCreate = [
  {
    id: 'f28e4766-0062-4303-9dce-159a29ddc128', // Auth ID
    email: 'admin@gosave.pk',
    full_name: 'Ahmad Hassan',
    role: 'admin',
    membership_id: '550e8400-e29b-41d4-a716-446655440002', // Premium membership
    status: 'active',
    membership_valid_until: '2025-12-31'
  },
  {
    id: 'b7fdbb69-b1f4-4cad-a776-cede4e9ff3c7', // Auth ID
    email: 'fatima.khan@gmail.com',
    full_name: 'Fatima Khan',
    role: 'member',
    membership_id: '550e8400-e29b-41d4-a716-446655440002', // Premium membership
    status: 'active',
    membership_valid_until: '2025-11-15'
  },
  {
    id: '17084d63-1180-4984-8156-ca41b7a00591', // Auth ID
    email: 'hassan.raza@gmail.com',
    full_name: 'Hassan Raza',
    role: 'member',
    membership_id: '550e8400-e29b-41d4-a716-446655440001', // Basic membership
    status: 'active',
    membership_valid_until: '2025-09-30'
  },
  {
    id: '626db9fc-7daa-42b0-bad4-fde596b37cfe', // Auth ID
    email: 'zainab.ali@gmail.com',
    full_name: 'Zainab Ali',
    role: 'viewer',
    membership_id: null, // No membership
    status: 'active',
    membership_valid_until: null
  },
  {
    id: 'd3e83130-e512-4457-826f-4f1f63f1037c', // Auth ID
    email: 'ali.ahmed@outlook.com',
    full_name: 'Ali Ahmed',
    role: 'member',
    membership_id: '550e8400-e29b-41d4-a716-446655440002', // Premium membership
    status: 'active',
    membership_valid_until: '2025-10-20'
  }
];

async function createMatchingUsers() {
  console.log('👥 Creating Database Users to Match Auth IDs\n');

  // First, let's clear any existing conflicting users
  console.log('🧹 Cleaning up existing users...');
  for (const user of usersToCreate) {
    try {
      // Delete by email first
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', user.email);

      if (deleteError) {
        console.log(`   ⚠️  Could not delete existing user ${user.email}:`, deleteError.message);
      } else {
        console.log(`   🗑️  Cleaned up existing user: ${user.email}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Error cleaning ${user.email}:`, error.message);
    }
  }

  console.log('\n👤 Creating new user records...');
  
  // Create users one by one for better error handling
  for (const user of usersToCreate) {
    try {
      console.log(`Creating: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Membership: ${user.membership_id ? 'Yes' : 'None'}`);

      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select();

      if (error) {
        console.error(`   ❌ Failed to create user:`, error.message);
      } else {
        console.log(`   ✅ Successfully created user`);
      }

    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error.message);
    }
    
    console.log('');
  }

  // Verify the creation
  console.log('🔍 Verifying created users...');
  
  for (const user of usersToCreate) {
    try {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role,
          membership_id,
          memberships (name)
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(`❌ ${user.email}: Not found in database`);
      } else {
        console.log(`✅ ${user.email}:`);
        console.log(`    Database ID: ${dbUser.id}`);
        console.log(`    Role: ${dbUser.role}`);
        console.log(`    Membership: ${dbUser.memberships?.name || 'None'}`);
      }

    } catch (error) {
      console.error(`❌ Error verifying ${user.email}:`, error.message);
    }
  }

  console.log('\n🎯 User creation completed!');
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@gosave.pk / admin123');
  console.log('   Premium Member: fatima.khan@gmail.com / member123');
  console.log('   Basic Member: hassan.raza@gmail.com / member123');
  console.log('   Viewer: zainab.ali@gmail.com / viewer123');
  console.log('   Premium Member 2: ali.ahmed@outlook.com / member123');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run the authentication test script again');
  console.log('2. Test frontend login');
  console.log('3. Verify all functionality works correctly');
}

createMatchingUsers().catch(console.error);
