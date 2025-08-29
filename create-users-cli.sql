-- SQL script to create auth users via Supabase SQL Editor
-- Run this in Supabase Dashboard > SQL Editor

-- Note: This approach requires using the auth.users table directly
-- which is only recommended for development/testing

-- Insert auth users with specific UUIDs to match our users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
-- Admin user
(
  '550e8400-e29b-41d4-a716-446655440010',
  '00000000-0000-0000-0000-000000000000',
  'admin@gosave.pk',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Ahmad Hassan", "role": "admin"}',
  false,
  'authenticated'
),
-- Premium member
(
  '550e8400-e29b-41d4-a716-446655440011',
  '00000000-0000-0000-0000-000000000000',
  'fatima.khan@gmail.com',
  crypt('member123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Fatima Khan", "role": "member"}',
  false,
  'authenticated'
),
-- Basic member
(
  '550e8400-e29b-41d4-a716-446655440014',
  '00000000-0000-0000-0000-000000000000',
  'hassan.raza@gmail.com',
  crypt('member123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Hassan Raza", "role": "member"}',
  false,
  'authenticated'
),
-- Viewer
(
  '550e8400-e29b-41d4-a716-446655440017',
  '00000000-0000-0000-0000-000000000000',
  'zainab.ali@gmail.com',
  crypt('viewer123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Zainab Ali", "role": "viewer"}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the users were created
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@gosave.pk',
  'fatima.khan@gmail.com', 
  'hassan.raza@gmail.com',
  'zainab.ali@gmail.com'
)
ORDER BY email;
