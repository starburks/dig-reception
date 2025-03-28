/*
  # Update schema for walk-in visitors

  1. Changes
    - Add has_appointment column to visitor_logs if it doesn't exist
    - Update walkin_settings table if it doesn't exist
    - Safe handling of existing objects

  2. Security
    - Disable RLS on walkin_settings table
*/

-- Add has_appointment column to visitor_logs if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visitor_logs' 
    AND column_name = 'has_appointment'
  ) THEN
    ALTER TABLE visitor_logs 
    ADD COLUMN has_appointment boolean DEFAULT true;
  END IF;
END $$;

-- Create walkin_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'walkin_settings'
  ) THEN
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

    -- Insert default walk-in settings
    INSERT INTO walkin_settings (chatwork_room_id, message_template)
    VALUES (
      '123456',
      '[info][title]予約なしのお客様[/title]{visitor_name}様{visitor_company_info}が来社されました。\n\n応対をお願いいたします。[/info]'
    );
  END IF;
END $$;

-- Ensure RLS is disabled on walkin_settings
ALTER TABLE walkin_settings DISABLE ROW LEVEL SECURITY;