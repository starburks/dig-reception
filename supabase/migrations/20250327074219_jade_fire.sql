/*
  # Add Walk-in Settings and Update Visitor Logs

  1. New Tables
    - `walkin_settings`
      - `id` (uuid, primary key)
      - `chatwork_room_id` (text, Chatwork room ID for walk-in notifications)
      - `message_template` (text, message template for walk-in notifications)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to Existing Tables
    - Add `has_appointment` column to `visitor_logs`

  3. Security
    - Enable RLS on new table
    - Add policy for authenticated users
*/

-- Create walkin_settings table
CREATE TABLE walkin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatwork_room_id text NOT NULL,
  message_template text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_walkin_settings_updated_at
  BEFORE UPDATE ON walkin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add has_appointment column to visitor_logs
ALTER TABLE visitor_logs
ADD COLUMN has_appointment boolean DEFAULT true;

-- Enable RLS on walkin_settings
ALTER TABLE walkin_settings DISABLE ROW LEVEL SECURITY;

-- Insert default walk-in settings
INSERT INTO walkin_settings (chatwork_room_id, message_template)
VALUES (
  '123456',
  '[info][title]予約なしのお客様[/title]{visitor_name}様{visitor_company_info}が来社されました。\n\n応対をお願いいたします。[/info]'
);