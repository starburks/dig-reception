/*
  # Initial Schema Setup

  1. Tables
    - Creates base tables for the visitor management system
    - Adds necessary indexes and foreign key relationships
    - Sets up updated_at triggers

  2. Security
    - Enables RLS on all tables
    - Sets up authenticated user policies

  3. Changes
    - Safe creation of all database objects
    - Handles existing objects gracefully
*/

-- Create updated_at function for triggers if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chatwork_room_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON companies;
CREATE POLICY "Allow full access for authenticated users"
  ON companies FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Staff Members table
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  department text,
  name text NOT NULL,
  chatwork_id text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_name ON staff_members (name);
CREATE INDEX IF NOT EXISTS idx_staff_members_company ON staff_members (company_id);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON staff_members;
CREATE POLICY "Allow full access for authenticated users"
  ON staff_members FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Visitor Logs table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_company text NOT NULL,
  staff_member_id uuid REFERENCES staff_members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs (created_at DESC);

ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON visitor_logs;
CREATE POLICY "Allow full access for authenticated users"
  ON visitor_logs FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Error Logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs (created_at DESC);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON error_logs;
CREATE POLICY "Allow full access for authenticated users"
  ON error_logs FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Chatwork Settings table
CREATE TABLE IF NOT EXISTS chatwork_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  message_template text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatwork_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON chatwork_settings;
CREATE POLICY "Allow full access for authenticated users"
  ON chatwork_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_chatwork_settings_updated_at ON chatwork_settings;
CREATE TRIGGER update_chatwork_settings_updated_at
  BEFORE UPDATE ON chatwork_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();