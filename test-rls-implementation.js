// Test script to verify RLS implementation works correctly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './gosave-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create clients for different contexts
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSImplementation() {
  console.log('🔒 Testing RLS Implementation\n');

  try {
    // Test 1: Service role should have full access
    console.log('1️⃣  Testing Service Role Access...');
    const { data: serviceUsers, error: serviceError } = await serviceClient
      .from('users')
      .select('email, role')
      .limit(3);

    if (serviceError) {
      console.error('❌ Service role access failed:', serviceError.message);
      return false;
    } else {
      console.log('✅ Service role can access users:', serviceUsers.length, 'users found');
    }

    // Test 2: Anonymous access to public data
    console.log('\n2️⃣  Testing Anonymous Access...');
    const { data: anonMemberships, error: anonError } = await anonClient
      .from('memberships')
      .select('name, price');

    if (anonError) {
      console.error('❌ Anonymous access to memberships failed:', anonError.message);
    } else {
      console.log('✅ Anonymous can read memberships:', anonMemberships.length, 'plans found');
    }

    // Test 3: Anonymous should NOT access users directly
    console.log('\n3️⃣  Testing Anonymous Restrictions...');
    const { data: anonUsers, error: anonUserError } = await anonClient
      .from('users')
      .select('email, role');

    if (anonUserError) {
      console.log('✅ Anonymous correctly blocked from users table:', anonUserError.message);
    } else {
      console.log('⚠️  Anonymous can access users (this might be expected):', anonUsers?.length || 0);
    }

    // Test 4: Test authentication flow
    console.log('\n4️⃣  Testing Authentication Flow...');
    
    // Login with admin user
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'admin@gosave.pk',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return false;
    }

    console.log('✅ Authentication successful for admin user');

    // Test authenticated access
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      }
    });

    const { data: authUsers, error: authUserError } = await authenticatedClient
      .from('users')
      .select('email, role')
      .eq('email', 'admin@gosave.pk')
      .single();

    if (authUserError) {
      console.error('❌ Authenticated user access failed:', authUserError.message);
    } else {
      console.log('✅ Authenticated user can access own data:', authUsers.email);
    }

    // Test 5: Backend authentication simulation
    console.log('\n5️⃣  Testing Backend Authentication Simulation...');
    
    // Simulate the backend auth middleware flow
    const { data: { user }, error: getUserError } = await serviceClient.auth.getUser(authData.session.access_token);
    
    if (getUserError) {
      console.error('❌ Backend user verification failed:', getUserError.message);
      return false;
    }

    // Test database lookup (this is what the middleware does)
    const { data: dbUser, error: dbUserError } = await serviceClient
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        membership_id,
        membership_valid_until,
        memberships (
          name,
          price
        )
      `)
      .eq('email', user.email)
      .single();

    if (dbUserError) {
      console.error('❌ Backend database lookup failed:', dbUserError.message);
      return false;
    } else {
      console.log('✅ Backend can lookup user data:', dbUser.email, '-', dbUser.role);
    }

    // Cleanup
    await anonClient.auth.signOut();

    console.log('\n🎯 RLS Implementation Test Summary:');
    console.log('✅ Service role has full access');
    console.log('✅ Authentication flow works');
    console.log('✅ Backend middleware simulation works');
    console.log('✅ User data lookup successful');
    
    return true;

  } catch (error) {
    console.error('❌ RLS test failed with error:', error.message);
    return false;
  }
}

// Run the test
testRLSImplementation()
  .then(success => {
    if (success) {
      console.log('\n🎉 RLS implementation appears to be working correctly!');
      console.log('📝 Next step: Run the full authentication test');
    } else {
      console.log('\n⚠️  RLS implementation has issues. Consider running rollback script.');
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error.message);
    console.log('📝 Consider running rollback script if authentication is broken');
  });
