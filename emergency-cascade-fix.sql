-- EMERGENCY CASCADE FIX for RLS Infinite Recursion
-- This uses CASCADE to force removal of dependent objects

-- STEP 1: Force drop functions with CASCADE (removes dependent policies automatically)
DROP FUNCTION IF EXISTS public.get_current_user_email() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_has_role(text) CASCADE;

-- STEP 2: Ensure all policies are dropped (in case CASCADE missed any)
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

-- STEP 3: Disable RLS temporarily to ensure system works
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- STEP 4: Test basic access
SELECT 'RLS_DISABLED_SUCCESSFULLY' as status, COUNT(*) as user_count FROM users;

-- STEP 5: Re-enable RLS for new policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create simple, non-recursive policies

-------------------------
-- USERS TABLE POLICIES (SIMPLE, NO RECURSION)
-------------------------

-- Service role (backend) has full access
CREATE POLICY "service_role_full_access_users" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can read their own profile using direct JWT
CREATE POLICY "authenticated_read_own_user" ON users
FOR SELECT 
TO authenticated
USING (
  email = COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (auth.jwt() ->> 'email')::text
  )
);

-------------------------
-- MEMBERSHIPS TABLE POLICIES
-------------------------

-- Service role has full access
CREATE POLICY "service_role_full_access_memberships" ON memberships
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read membership plans
CREATE POLICY "public_read_memberships" ON memberships
FOR SELECT 
TO anon, authenticated
USING (true);

-------------------------
-- PARTNERS TABLE POLICIES
-------------------------

-- Service role has full access
CREATE POLICY "service_role_full_access_partners" ON partners
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read approved partners
CREATE POLICY "public_read_approved_partners" ON partners
FOR SELECT 
TO anon, authenticated
USING (status = 'approved');

-------------------------
-- DEALS TABLE POLICIES
-------------------------

-- Service role has full access
CREATE POLICY "service_role_full_access_deals" ON deals
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read active deals
CREATE POLICY "public_read_deals" ON deals
FOR SELECT 
TO anon, authenticated
USING (
  start_date <= CURRENT_DATE 
  AND end_date >= CURRENT_DATE
);

-------------------------
-- PAYMENTS TABLE POLICIES
-------------------------

-- Service role has full access
CREATE POLICY "service_role_full_access_payments" ON payments
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');

-- Final test
SELECT 'EMERGENCY_FIX_COMPLETE' as status;
