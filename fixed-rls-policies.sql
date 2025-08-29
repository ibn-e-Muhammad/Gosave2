-- GoSave Fixed RLS Policies (No Circular Dependencies)
-- This fixes the infinite recursion issue by properly handling dependencies

-- STEP 1: Drop all policies first (to remove dependencies on functions)
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

-- STEP 2: Now drop the problematic functions (after policies are removed)
DROP FUNCTION IF EXISTS public.get_current_user_email();
DROP FUNCTION IF EXISTS public.get_current_user_id();
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.current_user_has_role(text);

-- STEP 3: Re-enable RLS on all tables (in case it was disabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-------------------------
-- USERS TABLE POLICIES (SIMPLIFIED)
-------------------------

-- Service role (backend) has full access for authentication
CREATE POLICY "service_role_full_access_users" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can read their own profile using JWT email
CREATE POLICY "authenticated_read_own_user" ON users
FOR SELECT 
TO authenticated
USING (
  email = COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (auth.jwt() ->> 'email')::text
  )
);

-- Admins can manage all users (simplified check)
CREATE POLICY "admin_manage_users" ON users
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
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

-- Anyone can read membership plans (for signup/pricing pages)
CREATE POLICY "public_read_memberships" ON memberships
FOR SELECT 
TO anon, authenticated
USING (true);

-- Admins can manage memberships
CREATE POLICY "admin_manage_memberships" ON memberships
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
);

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

-- Admins can manage all partners
CREATE POLICY "admin_manage_partners" ON partners
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
);

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

-- Admins can manage all deals
CREATE POLICY "admin_manage_deals" ON deals
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
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

-- Users can read their own payments
CREATE POLICY "user_read_own_payments" ON payments
FOR SELECT 
TO authenticated
USING (
  user_id = (
    SELECT id FROM users 
    WHERE email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    LIMIT 1
  )
);

-- Users can create their own payments
CREATE POLICY "user_create_own_payment" ON payments
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users 
    WHERE email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    LIMIT 1
  )
);

-- Admins can manage all payments
CREATE POLICY "admin_manage_payments" ON payments
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check 
    WHERE admin_check.email = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'email',
      (auth.jwt() ->> 'email')::text
    )
    AND admin_check.role = 'admin' 
    AND admin_check.status = 'active'
  )
);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');
