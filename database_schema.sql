-- MEMBERSHIPS (plans) FIRST
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL, -- basic / premium
  price numeric NOT NULL,
  duration_months int NOT NULL, -- e.g. 12 for yearly
  description text,
  created_at timestamptz DEFAULT now()
);

-- USERS
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('viewer', 'member', 'partner', 'admin')) DEFAULT 'viewer',
  membership_id uuid REFERENCES memberships(id) ON DELETE SET NULL,
  status text CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users
ADD COLUMN membership_valid_until date;


-- PARTNERS
CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  min_discount numeric,
  max_discount numeric,
  business_type text,
  address text,
  city text,
  contract_duration_months int,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- DEALS
CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  deal_title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  min_discount numeric,
  max_discount numeric,
  membership_tier text CHECK (membership_tier IN ('basic', 'premium', 'both')),
  location text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- PAYMENTS
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES memberships(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'PKR',
  status text CHECK (status IN ('pending', 'successful', 'failed')) DEFAULT 'pending',
  payment_method text, -- stripe, paypal, easypaisa, etc.
  reference_id text, -- external gateway transaction ID
  invoice_number serial UNIQUE, -- simple auto-increment invoice
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
