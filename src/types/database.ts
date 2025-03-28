import type { Database } from './supabase';

export type Tables = Database['public']['Tables'];
export type Company = Tables['companies']['Row'];
export type StaffMember = Tables['staff_members']['Row'];
export type ChatworkSettings = Tables['chatwork_settings']['Row'];
export type WalkinSettings = Tables['walkin_settings']['Row'];
export type VisitorLog = Tables['visitor_logs']['Row'];
export type ErrorLog = Tables['error_logs']['Row'];