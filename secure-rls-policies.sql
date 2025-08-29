-- GoSave Secure RLS Policies Implementation
-- This maintains current functionality while adding proper security

-- First, ensure we have the necessary functions for RLS
CREATE OR REPLACE FUNCTION auth.user_email() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (auth.jwt() ->> 'email')::text
  );
$$;

-- Function to get current user's database record
CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$
  SELECT id FROM users WHERE email = auth.user_email() LIMIT 1;
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE sql 
STABLE 
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE email = auth.user_email() 
    AND role = 'admin' 
    AND status = 'active'
  );
$$;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role text) 
RETURNS boolean 
LANGUAGE sql 
STABLE 
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE email = auth.user_email() 
    AND role = required_role 
    AND status = 'active'
  );
$$;

-- Function to get user's membership tier
CREATE OR REPLACE FUNCTION get_user_membership_tier() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  SELECT m.name 
  FROM users u 
  JOIN memberships m ON u.membership_id = m.id 
  WHERE u.email = auth.user_email() 
  AND u.status = 'active'
  AND u.membership_valid_until >= CURRENT_DATE
  LIMIT 1;
$$;

-- Drop existing policies to start fresh
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

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-------------------------
-- USERS TABLE POLICIES
-------------------------

-- Service role (backend) has full access for authentication
CREATE POLICY "service_role_full_access_users" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can read their own profile
CREATE POLICY "authenticated_read_own_user" ON users
FOR SELECT 
TO authenticated
USING (email = auth.user_email());

-- Admins can manage all users
CREATE POLICY "admin_manage_users" ON users
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

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
USING (is_admin())
WITH CHECK (is_admin());

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
USING (is_admin())
WITH CHECK (is_admin());

-------------------------
-- DEALS TABLE POLICIES
-------------------------

-- Service role has full access
CREATE POLICY "service_role_full_access_deals" ON deals
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read deals (basic filtering will be done in application logic)
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
USING (is_admin())
WITH CHECK (is_admin());

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
  user_id = get_current_user_id()
);

-- Users can create their own payments
CREATE POLICY "user_create_own_payment" ON payments
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = get_current_user_id()
);

-- Admins can manage all payments
CREATE POLICY "admin_manage_payments" ON payments
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'memberships', 'partners', 'deals', 'payments');
