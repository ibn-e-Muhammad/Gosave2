-- Week 3: Deal Management System - Database Updates
-- Add enhanced deal management columns and features

-- Add enhanced deal content management columns
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS terms_conditions text,
ADD COLUMN IF NOT EXISTS usage_instructions text,
ADD COLUMN IF NOT EXISTS max_redemptions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_redemptions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft', 'active', 'expired', 'paused')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create deal analytics table for tracking performance
CREATE TABLE IF NOT EXISTS deal_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    action_type text CHECK (action_type IN ('view', 'click', 'redeem', 'save')) NOT NULL,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Create deal categories table for better organization
CREATE TABLE IF NOT EXISTS deal_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    icon_name text, -- for UI icons
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Add category reference to deals
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES deal_categories(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_partner_id ON deals(partner_id);
CREATE INDEX IF NOT EXISTS idx_deals_category_id ON deals(category_id);
CREATE INDEX IF NOT EXISTS idx_deals_start_date ON deals(start_date);
CREATE INDEX IF NOT EXISTS idx_deals_end_date ON deals(end_date);
CREATE INDEX IF NOT EXISTS idx_deals_is_featured ON deals(is_featured);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_deal_id ON deal_analytics(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_action_type ON deal_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_created_at ON deal_analytics(created_at);

-- Add trigger to update updated_at timestamp for deals
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_deals_updated_at_trigger
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deals_updated_at();

-- Insert default deal categories
INSERT INTO deal_categories (name, description, icon_name) VALUES
('Food & Dining', 'Restaurants, cafes, and food services', 'utensils'),
('Fashion & Beauty', 'Clothing, accessories, and beauty services', 'shirt'),
('Electronics', 'Gadgets, phones, and electronic devices', 'smartphone'),
('Health & Fitness', 'Gyms, spas, and wellness services', 'heart'),
('Entertainment', 'Movies, events, and recreational activities', 'film'),
('Travel & Tourism', 'Hotels, travel packages, and tourism', 'map-pin'),
('Home & Living', 'Furniture, decor, and home services', 'home'),
('Education', 'Courses, books, and educational services', 'book-open'),
('Services', 'Professional and personal services', 'briefcase'),
('Other', 'Miscellaneous deals and offers', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample enhanced deals for testing
INSERT INTO deals (
    partner_id, 
    deal_title, 
    description, 
    start_date, 
    end_date, 
    min_discount, 
    max_discount, 
    membership_tier, 
    location, 
    city, 
    image_url, 
    terms_conditions, 
    usage_instructions, 
    max_redemptions, 
    is_featured, 
    status,
    category_id
)
SELECT 
    p.id,
    'Premium Dining Experience - 30% OFF',
    'Enjoy authentic Pakistani cuisine with a premium dining experience. Fresh ingredients, traditional recipes, and exceptional service.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    25,
    30,
    'premium',
    'DHA Phase 2',
    'Karachi',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'Valid for dine-in only. Cannot be combined with other offers. Valid from Sunday to Thursday.',
    'Show this deal on your phone to the waiter. Discount will be applied before tax.',
    100,
    true,
    'active',
    cat.id
FROM partners p
CROSS JOIN deal_categories cat
WHERE p.status = 'approved' 
AND cat.name = 'Food & Dining'
AND NOT EXISTS (
    SELECT 1 FROM deals d 
    WHERE d.partner_id = p.id 
    AND d.deal_title = 'Premium Dining Experience - 30% OFF'
)
LIMIT 1;

-- Add another sample deal
INSERT INTO deals (
    partner_id, 
    deal_title, 
    description, 
    start_date, 
    end_date, 
    min_discount, 
    max_discount, 
    membership_tier, 
    location, 
    city, 
    terms_conditions, 
    usage_instructions, 
    max_redemptions, 
    is_featured, 
    status,
    category_id
)
SELECT 
    p.id,
    'Fashion Sale - Up to 50% OFF',
    'Latest fashion trends at unbeatable prices. Premium quality clothing and accessories.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '15 days',
    20,
    50,
    'both',
    'Gulshan-e-Iqbal',
    'Karachi',
    'Valid on all items except sale items. Minimum purchase of PKR 2000 required.',
    'Present this deal at checkout. Discount will be applied on eligible items.',
    50,
    false,
    'active',
    cat.id
FROM partners p
CROSS JOIN deal_categories cat
WHERE p.status = 'approved' 
AND cat.name = 'Fashion & Beauty'
AND NOT EXISTS (
    SELECT 1 FROM deals d 
    WHERE d.partner_id = p.id 
    AND d.deal_title = 'Fashion Sale - Up to 50% OFF'
)
LIMIT 1;

-- Create analytics summary function
CREATE OR REPLACE FUNCTION get_deal_analytics_summary(
    p_start_date date DEFAULT '1970-01-01',
    p_end_date date DEFAULT '2099-12-31',
    p_deal_id uuid DEFAULT NULL
)
RETURNS TABLE(
    total_views bigint,
    total_clicks bigint,
    total_redeems bigint,
    total_saves bigint,
    unique_users bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN da.action_type = 'view' THEN 1 ELSE 0 END), 0) as total_views,
        COALESCE(SUM(CASE WHEN da.action_type = 'click' THEN 1 ELSE 0 END), 0) as total_clicks,
        COALESCE(SUM(CASE WHEN da.action_type = 'redeem' THEN 1 ELSE 0 END), 0) as total_redeems,
        COALESCE(SUM(CASE WHEN da.action_type = 'save' THEN 1 ELSE 0 END), 0) as total_saves,
        COUNT(DISTINCT da.user_id) as unique_users
    FROM deal_analytics da
    WHERE da.created_at::date >= p_start_date
    AND da.created_at::date <= p_end_date
    AND (p_deal_id IS NULL OR da.deal_id = p_deal_id);
END;
$$ LANGUAGE plpgsql;
