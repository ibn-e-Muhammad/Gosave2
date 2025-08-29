-- GoSave Database Dummy Data Population Script
-- Execute this script in Supabase SQL Editor

-- Clear existing data (in reverse order of dependencies)
DELETE FROM payments;
DELETE FROM deals;
DELETE FROM partners;
DELETE FROM users;
DELETE FROM memberships;

-- 1. MEMBERSHIPS (plans) - Insert membership plans first
INSERT INTO memberships (id, name, price, duration_months, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'basic', 2999, 12, 'Basic membership with access to standard deals and discounts'),
('550e8400-e29b-41d4-a716-446655440002', 'premium', 4999, 12, 'Premium membership with access to exclusive deals, higher discounts, and priority support');

-- 2. USERS - Insert users with different roles
INSERT INTO users (id, email, full_name, role, membership_id, status, membership_valid_until) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440010', 'admin@gosave.pk', 'Ahmad Hassan', 'admin', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-12-31'),

-- Premium members
('550e8400-e29b-41d4-a716-446655440011', 'fatima.khan@gmail.com', 'Fatima Khan', 'member', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-11-15'),
('550e8400-e29b-41d4-a716-446655440012', 'ali.ahmed@outlook.com', 'Ali Ahmed', 'member', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-10-20'),
('550e8400-e29b-41d4-a716-446655440013', 'sara.malik@yahoo.com', 'Sara Malik', 'member', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-12-05'),

-- Basic members
('550e8400-e29b-41d4-a716-446655440014', 'hassan.raza@gmail.com', 'Hassan Raza', 'member', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-09-30'),
('550e8400-e29b-41d4-a716-446655440015', 'ayesha.shah@hotmail.com', 'Ayesha Shah', 'member', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-11-10'),
('550e8400-e29b-41d4-a716-446655440016', 'usman.tariq@gmail.com', 'Usman Tariq', 'member', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-08-25'),

-- Viewers (non-members)
('550e8400-e29b-41d4-a716-446655440017', 'zainab.ali@gmail.com', 'Zainab Ali', 'viewer', NULL, 'active', NULL),
('550e8400-e29b-41d4-a716-446655440018', 'omar.sheikh@yahoo.com', 'Omar Sheikh', 'viewer', NULL, 'active', NULL);

-- 3. PARTNERS - Insert diverse Pakistani businesses
INSERT INTO partners (id, brand_name, owner_name, email, phone, website, min_discount, max_discount, business_type, address, city, contract_duration_months, status) VALUES
-- Food & Restaurants
('550e8400-e29b-41d4-a716-446655440020', 'Chai Wala Corner', 'Rashid Ali', 'chaiwala@example.com', '+92-300-1234567', 'www.chaiwalacorner.pk', 10, 25, 'Food & Drink', 'G-9 Markaz', 'Islamabad', 12, 'approved'),
('550e8400-e29b-41d4-a716-446655440021', 'Karachi Biryani House', 'Muhammad Saleem', 'kbiryani@example.com', '+92-321-9876543', 'www.karachibiryani.pk', 15, 30, 'Food & Drink', 'Gulshan-e-Iqbal', 'Karachi', 12, 'approved'),
('550e8400-e29b-41d4-a716-446655440022', 'Lahori Kulfi Corner', 'Amjad Hussain', 'kulfi@example.com', '+92-300-5555555', NULL, 8, 20, 'Food & Drink', 'Liberty Market', 'Lahore', 6, 'approved'),

-- Clothing & Fashion
('550e8400-e29b-41d4-a716-446655440023', 'Stitch & Style', 'Ayesha Khan', 'stitchstyle@example.com', '+92-333-7777777', 'www.stitchstyle.pk', 15, 40, 'Clothing', 'Liberty Market', 'Lahore', 12, 'approved'),
('550e8400-e29b-41d4-a716-446655440024', 'Desi Threads', 'Farah Noor', 'desithreads@example.com', '+92-345-8888888', 'www.desithreads.com', 20, 50, 'Clothing', 'Zamzama Street', 'Karachi', 12, 'approved'),

-- Electronics & Tech
('550e8400-e29b-41d4-a716-446655440025', 'ByteFix Labs', 'Umair Raza', 'bytefix@example.com', '+92-300-9999999', 'www.bytefixlabs.pk', 5, 25, 'Electronics', 'Saddar', 'Karachi', 12, 'approved'),
('550e8400-e29b-41d4-a716-446655440026', 'Tech Valley', 'Bilal Ahmad', 'techvalley@example.com', '+92-333-1111111', 'www.techvalley.pk', 10, 30, 'Electronics', 'Blue Area', 'Islamabad', 12, 'approved'),

-- Health & Beauty
('550e8400-e29b-41d4-a716-446655440027', 'Glow Beauty Salon', 'Sana Malik', 'glow@example.com', '+92-300-2222222', NULL, 15, 35, 'Beauty & Wellness', 'DHA Phase 5', 'Lahore', 6, 'approved'),
('550e8400-e29b-41d4-a716-446655440028', 'Fitness First Gym', 'Tariq Mehmood', 'fitness@example.com', '+92-321-3333333', 'www.fitnessfirst.pk', 20, 40, 'Health & Fitness', 'F-7 Markaz', 'Islamabad', 12, 'approved'),

-- Pending partners
('550e8400-e29b-41d4-a716-446655440029', 'New Cafe Express', 'Zara Ahmed', 'newcafe@example.com', '+92-300-4444444', NULL, 10, 20, 'Food & Drink', 'Gulberg', 'Lahore', 12, 'pending');

-- 4. DEALS - Insert deals linked to partners
INSERT INTO deals (id, partner_id, deal_title, description, start_date, end_date, min_discount, max_discount, membership_tier, location, city) VALUES
-- Food & Restaurant Deals
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'Buy 2 Parathas, Get 1 Free', 'Valid on weekends only. Fresh parathas with authentic Pakistani taste.', '2025-08-16', '2025-10-23', 10, 20, 'basic', 'G-9 Markaz', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', '25% Off Family Tea Package', 'Premium tea experience for families. Includes traditional snacks.', '2025-08-20', '2025-11-30', 20, 25, 'premium', 'G-9 Markaz', 'Islamabad'),

('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', 'Flat 15% on Biryani Platters', 'Authentic Karachi-style biryani with raita and shorba.', '2025-08-15', '2025-12-31', 15, 15, 'both', 'Gulshan-e-Iqbal', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', '30% Off Premium Biryani', 'Special mutton and chicken biryani with premium ingredients.', '2025-09-01', '2025-11-15', 30, 30, 'premium', 'Gulshan-e-Iqbal', 'Karachi'),

('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440022', 'Buy 3 Kulfi, Get 1 Free', 'Traditional kulfi made with pure milk and dry fruits.', '2025-08-10', '2025-10-31', 20, 20, 'basic', 'Liberty Market', 'Lahore'),

-- Clothing & Fashion Deals
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440023', 'Flat 12% on Summer Collection', 'All summer clothing items included. Latest fashion trends.', '2025-08-13', '2025-10-08', 12, 12, 'both', 'Liberty Market', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440023', '40% Off Premium Suits', 'Designer suits and formal wear for special occasions.', '2025-09-01', '2025-12-25', 35, 40, 'premium', 'Liberty Market', 'Lahore'),

('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440024', '25% Off Traditional Wear', 'Shalwar kameez, kurtas, and traditional Pakistani clothing.', '2025-08-20', '2025-11-20', 20, 25, 'basic', 'Zamzama Street', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440024', '50% Off Designer Collection', 'Exclusive designer pieces and limited edition items.', '2025-09-15', '2025-12-31', 45, 50, 'premium', 'Zamzama Street', 'Karachi'),

-- Electronics & Tech Deals
('550e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440025', '10% Off Laptop Repairs', 'Professional laptop repair services with warranty.', '2025-08-01', '2025-12-31', 10, 10, 'basic', 'Saddar', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440025', '25% Off Premium Tech Support', 'Complete tech solutions and premium support packages.', '2025-08-15', '2025-11-30', 20, 25, 'premium', 'Saddar', 'Karachi'),

('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440026', '15% Off Mobile Accessories', 'Cases, chargers, and mobile accessories.', '2025-08-10', '2025-10-15', 15, 15, 'both', 'Blue Area', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440026', '30% Off Gaming Setup', 'Complete gaming accessories and setup consultation.', '2025-09-01', '2025-12-15', 25, 30, 'premium', 'Blue Area', 'Islamabad'),

-- Health & Beauty Deals
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440027', '20% Off Facial Treatments', 'Professional facial treatments and skincare services.', '2025-08-05', '2025-11-05', 15, 20, 'basic', 'DHA Phase 5', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440027', '35% Off Bridal Packages', 'Complete bridal makeup and styling packages.', '2025-09-01', '2025-12-31', 30, 35, 'premium', 'DHA Phase 5', 'Lahore'),

('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440028', '25% Off Monthly Membership', '1-month gym membership with trainer consultation.', '2025-08-01', '2025-10-31', 20, 25, 'basic', 'F-7 Markaz', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440028', '40% Off Annual Membership', '12-month gym membership with personal trainer.', '2025-08-15', '2025-12-31', 35, 40, 'premium', 'F-7 Markaz', 'Islamabad');

-- 5. PAYMENTS - Insert payment records for members
INSERT INTO payments (id, user_id, membership_id, amount, currency, status, payment_method, reference_id) VALUES
-- Successful payments for premium members
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 4999, 'PKR', 'successful', 'easypaisa', 'EP2025081501234'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 4999, 'PKR', 'successful', 'jazzcash', 'JC2025082012345'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 4999, 'PKR', 'successful', 'bank_transfer', 'BT2025081823456'),

-- Successful payments for basic members
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 2999, 'PKR', 'successful', 'easypaisa', 'EP2025080534567'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 2999, 'PKR', 'successful', 'jazzcash', 'JC2025081045678'),
('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', 2999, 'PKR', 'successful', 'credit_card', 'CC2025080756789'),

-- Some pending/failed payments for demonstration
('550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440001', 2999, 'PKR', 'pending', 'easypaisa', 'EP2025082867890'),
('550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 4999, 'PKR', 'failed', 'jazzcash', 'JC2025082978901');

-- Verification queries to check data insertion
-- SELECT 'Memberships' as table_name, count(*) as count FROM memberships
-- UNION ALL
-- SELECT 'Users', count(*) FROM users
-- UNION ALL
-- SELECT 'Partners', count(*) FROM partners
-- UNION ALL
-- SELECT 'Deals', count(*) FROM deals
-- UNION ALL
-- SELECT 'Payments', count(*) FROM payments;

-- Sample queries to verify relationships
-- SELECT u.full_name, m.name as membership_type, u.membership_valid_until
-- FROM users u
-- LEFT JOIN memberships m ON u.membership_id = m.id
-- WHERE u.role = 'member';

-- SELECT p.brand_name, count(d.id) as deal_count
-- FROM partners p
-- LEFT JOIN deals d ON p.id = d.partner_id
-- GROUP BY p.id, p.brand_name
-- ORDER BY deal_count DESC;
