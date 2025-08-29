-- EMERGENCY ROLLBACK SCRIPT
-- Run this if RLS implementation breaks functionality

-- Disable RLS on all tables (restore working state)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "service_role_full_access_users" ON users;
DROP POLICY IF EXISTS "authenticated_read_own_user" ON users;
DROP POLICY IF EXISTS "admin_manage_users" ON users;

DROP POLICY IF EXISTS "service_role_full_access_memberships" ON memberships;
DROP POLICY IF EXISTS "public_read_memberships" ON memberships;
DROP POLICY IF EXISTS "admin_manage_memberships" ON memberships;

DROP POLICY IF EXISTS "service_role_full_access_partners" ON partners;
DROP POLICY IF EXISTS "public_read_approved_partners" ON partners;
DROP POLICY IF EXISTS "admin_manage_partners" ON partners;

DROP POLICY IF EXISTS "service_role_full_access_deals" ON deals;
DROP POLICY IF EXISTS "public_read_deals" ON deals;
DROP POLICY IF EXISTS "member_read_appropriate_deals" ON deals;
DROP POLICY IF EXISTS "admin_manage_deals" ON deals;

DROP POLICY IF EXISTS "service_role_full_access_payments" ON payments;
DROP POLICY IF EXISTS "user_read_own_payments" ON payments;
DROP POLICY IF EXISTS "user_create_own_payment" ON payments;
DROP POLICY IF EXISTS "admin_manage_payments" ON payments;

-- Drop helper functions (updated for public schema)
DROP FUNCTION IF EXISTS public.get_current_user_email();
DROP FUNCTION IF EXISTS public.get_current_user_id();
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.current_user_has_role(text);

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');

-- Test basic query to ensure access is restored
SELECT COUNT(*) as user_count FROM users;
