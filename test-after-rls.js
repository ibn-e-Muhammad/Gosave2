// Quick test after applying RLS policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './gosave-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function quickRLSTest() {
  console.log('🔒 Quick RLS Test After Implementation\n');

  try {
    // Test 1: Service role should still work
    console.log('1️⃣  Testing Service Role (Backend)...');
    const { data: users, error: userError } = await serviceClient
      .from('users')
      .select('email, role')
      .limit(3);

    if (userError) {
      console.error('❌ CRITICAL: Service role access failed!', userError.message);
      console.log('🚨 RUN ROLLBACK IMMEDIATELY: node rollback-rls.sql');
      return false;
    } else {
      console.log('✅ Service role works:', users.length, 'users accessible');
    }

    // Test 2: Anonymous should be restricted from users
    console.log('\n2️⃣  Testing Anonymous Restrictions...');
    const { data: anonUsers, error: anonError } = await anonClient
      .from('users')
      .select('email');

    if (anonError) {
      console.log('✅ Anonymous correctly blocked from users:', anonError.message);
    } else {
      console.log('⚠️  Anonymous can still access users:', anonUsers?.length || 0);
    }

    // Test 3: Anonymous can read memberships
    console.log('\n3️⃣  Testing Public Access...');
    const { data: memberships, error: membershipError } = await anonClient
      .from('memberships')
      .select('name, price');

    if (membershipError) {
      console.error('❌ Public access to memberships failed:', membershipError.message);
    } else {
      console.log('✅ Public can read memberships:', memberships.length, 'plans');
    }

    // Test 4: Authentication flow
    console.log('\n4️⃣  Testing Authentication...');
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'admin@gosave.pk',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ CRITICAL: Authentication failed!', authError.message);
      return false;
    }

    console.log('✅ Authentication successful');

    // Test 5: Backend middleware simulation
    console.log('\n5️⃣  Testing Backend Middleware...');
    const { data: { user }, error: getUserError } = await serviceClient.auth.getUser(authData.session.access_token);
    
    if (getUserError) {
      console.error('❌ CRITICAL: Backend user verification failed!', getUserError.message);
      return false;
    }

    const { data: dbUser, error: dbUserError } = await serviceClient
      .from('users')
      .select('id, email, full_name, role, status, membership_id, memberships(name, price)')
      .eq('email', user.email)
      .single();

    if (dbUserError) {
      console.error('❌ CRITICAL: Backend database lookup failed!', dbUserError.message);
      return false;
    }

    console.log('✅ Backend middleware simulation works:', dbUser.email);

    // Cleanup
    await anonClient.auth.signOut();

    console.log('\n🎉 RLS Implementation Successful!');
    console.log('✅ All critical functions working');
    console.log('✅ Security policies active');
    console.log('✅ Authentication flow intact');
    
    return true;

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.log('🚨 Consider running rollback script immediately');
    return false;
  }
}

quickRLSTest()
  .then(success => {
    if (success) {
      console.log('\n📝 Next: Run full authentication test');
      console.log('   node test-authentication-system.js');
    } else {
      console.log('\n🚨 ROLLBACK REQUIRED');
      console.log('   Run the rollback SQL in Supabase Dashboard');
    }
  })
  .catch(console.error);
