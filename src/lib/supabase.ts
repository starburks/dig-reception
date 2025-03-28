import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test the connection and log table information
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
      .single();

    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      return false;
    }

    console.log('Connection test successful');

    // Test Chatwork settings
    const { data: settings, error: settingsError } = await supabase
      .from('chatwork_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Failed to fetch Chatwork settings:', settingsError);
    } else {
      console.log('Chatwork settings:', {
        exists: !!settings,
        hasApiKey: settings?.api_key ? 'Yes' : 'No',
        hasTemplate: settings?.message_template ? 'Yes' : 'No'
      });
    }

    // Test companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');

    if (companiesError) {
      console.error('Failed to fetch companies:', companiesError);
    } else {
      console.log('Companies:', {
        count: companies?.length || 0,
        hasRoomIds: companies?.filter(c => c.chatwork_room_id).length || 0
      });
    }

    // Test staff_members table
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff_members')
      .select(`
        *,
        companies (
          name,
          chatwork_room_id
        )
      `);

    if (staffError) {
      console.error('Failed to fetch staff members:', staffError);
    } else {
      console.log('Staff members:', {
        count: staffMembers?.length || 0,
        withCompanies: staffMembers?.filter(s => s.companies).length || 0
      });
    }

    return !settingsError && !companiesError && !staffError;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};