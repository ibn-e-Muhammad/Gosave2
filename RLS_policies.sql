-- Enable RLS on all tables
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "user_select_self" ON users;
DROP POLICY IF EXISTS "user_update_self" ON users;
DROP POLICY IF EXISTS "admin_manage_users" ON users;

DROP POLICY IF EXISTS "public_read_memberships" ON memberships;
DROP POLICY IF EXISTS "admin_manage_memberships" ON memberships;

DROP POLICY IF EXISTS "public_read_partners" ON partners;
DROP POLICY IF EXISTS "admin_manage_partners" ON partners;

DROP POLICY IF EXISTS "public_read_deals" ON deals;
DROP POLICY IF EXISTS "admin_manage_deals" ON deals;

DROP POLICY IF EXISTS "user_read_own_payments" ON payments;
DROP POLICY IF EXISTS "user_create_own_payment" ON payments;
DROP POLICY IF EXISTS "admin_manage_payments" ON payments;

-------------------------
-- USERS
-------------------------
-- Users can read/update their own row
CREATE POLICY "user_select_self" ON users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_update_self" ON users
FOR UPDATE USING (id = auth.uid());

-- Admin can do anything on users
CREATE POLICY "admin_manage_users" ON users
FOR ALL
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-------------------------
-- MEMBERSHIPS
-------------------------
-- Public can read plan info
CREATE POLICY "public_read_memberships" ON memberships
FOR SELECT USING (true);

-- Admin manages plans
CREATE POLICY "admin_manage_memberships" ON memberships
FOR ALL
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-------------------------
-- PARTNERS (admin-only to write)
-------------------------
-- Public can read partners (to show cards)
CREATE POLICY "public_read_partners" ON partners
FOR SELECT USING (true);

-- Admin manages partners
CREATE POLICY "admin_manage_partners" ON partners
FOR ALL
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-------------------------
-- DEALS (admin-only to write)
-------------------------
-- Public can read deals
CREATE POLICY "public_read_deals" ON deals
FOR SELECT USING (true);

-- Admin manages deals
CREATE POLICY "admin_manage_deals" ON deals
FOR ALL
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-------------------------
-- PAYMENTS
-------------------------
-- Users see their own payments
CREATE POLICY "user_read_own_payments" ON payments
FOR SELECT USING (user_id = auth.uid());

-- (Optional) Users can create their own payment rows (if you insert from client)
CREATE POLICY "user_create_own_payment" ON payments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admin manages all payments
CREATE POLICY "admin_manage_payments" ON payments
FOR ALL
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);