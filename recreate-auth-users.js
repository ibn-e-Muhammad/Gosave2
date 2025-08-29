// Script to recreate auth users with correct UUIDs matching database
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

// Users with their correct database UUIDs
const usersToRecreate = [
  {
    email: 'admin@gosave.pk',
    password: 'admin123',
    user_id: '550e8400-e29b-41d4-a716-446655440010', // Original database UUID
    full_name: 'Ahmad Hassan',
    role: 'admin'
  },
  {
    email: 'fatima.khan@gmail.com',
    password: 'member123',
    user_id: '550e8400-e29b-41d4-a716-446655440011',
    full_name: 'Fatima Khan',
    role: 'member (premium)'
  },
  {
    email: 'hassan.raza@gmail.com',
    password: 'member123',
    user_id: '550e8400-e29b-41d4-a716-446655440014',
    full_name: 'Hassan Raza',
    role: 'member (basic)'
  },
  {
    email: 'zainab.ali@gmail.com',
    password: 'viewer123',
    user_id: '550e8400-e29b-41d4-a716-446655440017',
    full_name: 'Zainab Ali',
    role: 'viewer'
  },
  {
    email: 'ali.ahmed@outlook.com',
    password: 'member123',
    user_id: '550e8400-e29b-41d4-a716-446655440012',
    full_name: 'Ali Ahmed',
    role: 'member (premium)'
  }
];

async function recreateAuthUsers() {
  console.log('🔄 Recreating Auth Users with Correct UUIDs\n');

  // Step 1: Delete existing auth users
  console.log('1️⃣  Deleting existing auth users...');
  try {
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list existing users:', listError.message);
      return;
    }

    for (const user of existingUsers.users) {
      if (usersToRecreate.some(u => u.email === user.email)) {
        console.log(`   Deleting: ${user.email}`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`   ❌ Failed to delete ${user.email}:`, deleteError.message);
        } else {
          console.log(`   ✅ Deleted ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during deletion phase:', error.message);
    return;
  }

  console.log('\n2️⃣  Creating auth users with correct UUIDs...');

  // Step 2: Create users with correct UUIDs
  for (const user of usersToRecreate) {
    try {
      console.log(`Creating: ${user.email} with UUID ${user.user_id}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        },
        email_confirm: true,
        user_id: user.user_id // Use the original database UUID
      });
      
      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message);
      } else {
        console.log(`✅ Successfully created: ${user.email}`);
        console.log(`   User ID: ${data.user.id}`);
        console.log(`   Matches database: ${data.user.id === user.user_id ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error creating ${user.email}:`, error.message);
    }
    
    console.log('');
  }

  // Step 3: Verify the recreation
  console.log('3️⃣  Verifying recreated users...');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Failed to list users for verification:', error.message);
    } else {
      console.log(`✅ Total auth users: ${users.users.length}`);
      
      for (const user of usersToRecreate) {
        const authUser = users.users.find(u => u.email === user.email);
        if (authUser) {
          const idMatches = authUser.id === user.user_id;
          console.log(`   ${idMatches ? '✅' : '❌'} ${user.email} - ID: ${authUser.id} ${idMatches ? '(matches database)' : '(ID mismatch)'}`);
        } else {
          console.log(`   ❌ ${user.email} - Not found`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error verifying users:', error.message);
  }

  console.log('\n🎯 Auth user recreation completed!');
  console.log('\n🔑 Test Credentials (with matching database UUIDs):');
  console.log('   Admin: admin@gosave.pk / admin123');
  console.log('   Premium Member: fatima.khan@gmail.com / member123');
  console.log('   Basic Member: hassan.raza@gmail.com / member123');
  console.log('   Viewer: zainab.ali@gmail.com / viewer123');
  console.log('   Premium Member 2: ali.ahmed@outlook.com / member123');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run the authentication test script');
  console.log('2. Test frontend login with these credentials');
  console.log('3. Verify that user profiles are fetched correctly');
}

recreateAuthUsers().catch(console.error);
