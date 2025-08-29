// Simple script to disable RLS
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './gosave-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🔧 Disabling Row Level Security\n');

  // Test current user query
  console.log('Testing current user query...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, role')
      .eq('email', 'admin@gosave.pk')
      .single();

    if (error) {
      console.error('❌ Current query fails:', error.message);
    } else {
      console.log('✅ Query works:', data);
    }
  } catch (error) {
    console.error('❌ Query error:', error.message);
  }

  console.log('\n📝 Manual Steps Required:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Navigate to Database > Tables');
  console.log('3. For each table (users, memberships, partners, deals, payments):');
  console.log('   - Click on the table');
  console.log('   - Go to "RLS" tab');
  console.log('   - Click "Disable RLS" button');
  console.log('4. Or run this SQL in SQL Editor:');
  console.log('');
  console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE partners DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE deals DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE payments DISABLE ROW LEVEL SECURITY;');
}

disableRLS().catch(console.error);
