-- Week 2: Partner Approval System - Database Updates
-- Add admin tracking columns to partners table

ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample pending partners for testing (if not exists)
INSERT INTO partners (brand_name, owner_name, email, phone, website, business_type, address, city, min_discount, max_discount, contract_duration_months, status)
SELECT 'Pending Cafe', 'Ahmed Ali', 'ahmed@pendingcafe.com', '+92300123456', 'https://pendingcafe.com', 'Restaurant', '123 Food Street', 'Karachi', 10, 25, 12, 'pending'
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE email = 'ahmed@pendingcafe.com');

INSERT INTO partners (brand_name, owner_name, email, phone, website, business_type, address, city, min_discount, max_discount, contract_duration_months, status)
SELECT 'Review Shop', 'Sara Khan', 'sara@reviewshop.com', '+92300789012', 'https://reviewshop.com', 'Retail', '456 Shopping Mall', 'Lahore', 15, 30, 6, 'pending'
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE email = 'sara@reviewshop.com');
