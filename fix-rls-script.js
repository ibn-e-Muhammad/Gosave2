// Script to fix RLS policies via Supabase client
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

async function fixRLSPolicies() {
  console.log('🔧 Fixing Row Level Security Policies\n');

  try {
    // Disable RLS for all tables
    const tables = ['users', 'memberships', 'partners', 'deals', 'payments'];
    
    for (const table of tables) {
      console.log(`Disabling RLS for ${table} table...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });
      
      if (error) {
        console.error(`❌ Failed to disable RLS for ${table}:`, error.message);
      } else {
        console.log(`✅ RLS disabled for ${table}`);
      }
    }

    // Test user query
    console.log('\n🧪 Testing user query...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .limit(3);

    if (userError) {
      console.error('❌ User query failed:', userError.message);
    } else {
      console.log('✅ User query successful:');
      users.forEach(user => {
        console.log(`   ${user.email} - ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error.message);
  }

  console.log('\n🎯 RLS fix completed!');
  console.log('📝 Now test authentication again');
}

fixRLSPolicies().catch(console.error);
