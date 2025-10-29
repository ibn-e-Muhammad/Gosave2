import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key for frontend operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test database connection (for development)
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Frontend Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Frontend Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Frontend Supabase connection error:', error.message);
    return false;
  }
};

export default supabase;
