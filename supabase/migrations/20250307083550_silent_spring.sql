/*
  # Admin Dashboard Schema

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `chatwork_room_id` (text, Chatwork room ID)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `staff_members`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `department` (text, department name)
      - `name` (text, staff name)
      - `chatwork_id` (text, Chatwork user ID)
      - `photo_url` (text, URL to photo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatwork_settings`
      - `id` (uuid, primary key)
      - `api_key` (text, encrypted)
      - `message_template` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `visitor_logs`
      - `id` (uuid, primary key)
      - `visitor_name` (text)
      - `visitor_company` (text)
      - `staff_member_id` (uuid, foreign key to staff_members)
      - `created_at` (timestamp)

    - `error_logs`
      - `id` (uuid, primary key)
      - `error_message` (text)
      - `error_stack` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
*/

-- Companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chatwork_room_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_companies_name ON companies(name);

-- Staff members table
CREATE TABLE staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  department text,
  name text NOT NULL,
  chatwork_id text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_staff_members_company ON staff_members(company_id);
CREATE INDEX idx_staff_members_name ON staff_members(name);

-- Chatwork settings table
CREATE TABLE chatwork_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  message_template text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitor logs table
CREATE TABLE visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_company text NOT NULL,
  staff_member_id uuid REFERENCES staff_members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_visitor_logs_created_at ON visitor_logs(created_at DESC);

-- Error logs table
CREATE TABLE error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwork_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow full access for authenticated users" ON companies
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON staff_members
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON chatwork_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON visitor_logs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON error_logs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatwork_settings_updated_at
  BEFORE UPDATE ON chatwork_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();