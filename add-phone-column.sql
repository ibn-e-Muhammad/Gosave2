-- Add phone column to users table for registration system
-- Run this in Supabase SQL Editor

-- Add phone column to users table
ALTER TABLE users 
ADD COLUMN phone text;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that the table structure is correct
SELECT 'PHONE_COLUMN_ADDED' as status;
