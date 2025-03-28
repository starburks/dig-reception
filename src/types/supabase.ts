export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          chatwork_room_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          chatwork_room_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          chatwork_room_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          id: string
          company_id: string | null
          department: string | null
          name: string
          chatwork_id: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          department?: string | null
          name: string
          chatwork_id?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          department?: string | null
          name?: string
          chatwork_id?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      chatwork_settings: {
        Row: {
          id: string
          api_key: string
          message_template: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          api_key: string
          message_template?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          api_key?: string
          message_template?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      walkin_settings: {
        Row: {
          id: string
          chatwork_room_id: string
          message_template: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatwork_room_id: string
          message_template: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatwork_room_id?: string
          message_template?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      visitor_logs: {
        Row: {
          id: string
          visitor_name: string
          visitor_company: string
          staff_member_id: string | null
          has_appointment: boolean
          created_at: string
        }
        Insert: {
          id?: string
          visitor_name: string
          visitor_company: string
          staff_member_id?: string | null
          has_appointment?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          visitor_name?: string
          visitor_company?: string
          staff_member_id?: string | null
          has_appointment?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_logs_staff_member_id_fkey"
            columns: ["staff_member_id"]
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          }
        ]
      }
      error_logs: {
        Row: {
          id: string
          error_message: string
          error_stack: string | null
          created_at: string
        }
        Insert: {
          id?: string
          error_message: string
          error_stack?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          error_message?: string
          error_stack?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}