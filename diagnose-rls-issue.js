// Diagnostic script to understand RLS authentication issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './gosave-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseRLSIssue() {
  console.log('🔍 Diagnosing RLS Authentication Issue\n');

  try {
    // Step 1: Test basic service role access
    console.log('1️⃣  Testing Basic Service Role Access...');
    const { data: basicUsers, error: basicError } = await serviceClient
      .from('users')
      .select('email, role')
      .limit(3);

    if (basicError) {
      console.error('❌ Basic service role access failed:', basicError.message);
      return;
    } else {
      console.log('✅ Basic service role access works:', basicUsers.length, 'users');
    }

    // Step 2: Test specific email lookup (what middleware does)
    console.log('\n2️⃣  Testing Email-Based Lookup (Middleware Simulation)...');
    const { data: emailUser, error: emailError } = await serviceClient
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
      .eq('email', 'admin@gosave.pk')
      .single();

    if (emailError) {
      console.error('❌ Email-based lookup failed:', emailError.message);
      console.error('❌ This is likely the cause of the 401 error');
    } else {
      console.log('✅ Email-based lookup works:', emailUser.email);
    }

    // Step 3: Test authentication flow
    console.log('\n3️⃣  Testing Full Authentication Flow...');
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'admin@gosave.pk',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Supabase authentication successful');

    // Step 4: Test getUser with token (what middleware does)
    console.log('\n4️⃣  Testing Token Verification...');
    const { data: { user }, error: getUserError } = await serviceClient.auth.getUser(authData.session.access_token);
    
    if (getUserError) {
      console.error('❌ Token verification failed:', getUserError.message);
      return;
    }

    console.log('✅ Token verification successful:', user.email);

    // Step 5: Test database lookup with verified user email
    console.log('\n5️⃣  Testing Database Lookup After Token Verification...');
    const { data: verifiedUser, error: verifiedError } = await serviceClient
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

    if (verifiedError) {
      console.error('❌ Database lookup after verification failed:', verifiedError.message);
      console.error('❌ This confirms the RLS policy issue');
    } else {
      console.log('✅ Database lookup after verification works:', verifiedUser.email);
    }

    // Step 6: Test RLS helper functions
    console.log('\n6️⃣  Testing RLS Helper Functions...');
    const { data: helperTest, error: helperError } = await serviceClient
      .rpc('get_current_user_email');

    if (helperError) {
      console.error('❌ Helper function failed:', helperError.message);
    } else {
      console.log('✅ Helper function works:', helperTest);
    }

    // Cleanup
    await anonClient.auth.signOut();

    console.log('\n🎯 Diagnosis Summary:');
    console.log('If email-based lookup failed, the issue is RLS blocking service role queries');
    console.log('If helper function failed, the issue is with the RLS helper functions');

  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
  }
}

diagnoseRLSIssue().catch(console.error);
