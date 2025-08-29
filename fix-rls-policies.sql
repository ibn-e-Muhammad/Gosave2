-- Fix Row Level Security policies for GoSave authentication
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily for users table to allow authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for other tables that might cause issues
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Alternative: Create proper RLS policies (commented out for now)
-- If you want to enable RLS later, use these policies:

/*
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy for service role to read all users (for authentication)
CREATE POLICY "Service role can read all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to read user data (for joins)
CREATE POLICY "Authenticated users can read user data" ON users
  FOR SELECT USING (auth.role() = 'authenticated');
*/

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');

-- Test query to verify users table is accessible
SELECT id, email, full_name, role FROM users LIMIT 5;
