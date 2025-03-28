/*
  # Disable Row Level Security

  1. Changes
    - Disable RLS on all tables to allow unrestricted access
    - Drop all existing policies
*/

-- Disable RLS on all tables
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatwork_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON staff_members;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON chatwork_settings;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON visitor_logs;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON error_logs;