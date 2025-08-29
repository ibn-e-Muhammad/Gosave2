-- EMERGENCY: Completely disable RLS to restore authentication
-- This will restore full functionality immediately

-- Step 1: Drop ALL policies (to remove any circular dependencies)
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

-- Step 2: Drop any remaining functions
DROP FUNCTION IF EXISTS public.get_current_user_email() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_has_role(text) CASCADE;

-- Step 3: Completely disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');

-- Step 5: Test basic access
SELECT 'RLS_COMPLETELY_DISABLED' as status, COUNT(*) as user_count FROM users;

-- Step 6: Test specific user lookup (what the middleware does)
SELECT 'USER_LOOKUP_TEST' as test, email, role 
FROM users 
WHERE email = 'admin@gosave.pk';

SELECT 'EMERGENCY_RESTORATION_COMPLETE' as final_status;
