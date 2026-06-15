export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: 'free' | 'pro' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      corridors: {
        Row: {
          id: string
          name: string
          country_work: string
          country_residence: string
          threshold_days: number
          alert_days: number[]
          description: string | null
          legal_reference: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country_work: string
          country_residence: string
          threshold_days: number
          alert_days?: number[]
          description?: string | null
          legal_reference?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          threshold_days?: number
          alert_days?: number[]
          description?: string | null
          legal_reference?: string | null
          is_active?: boolean
        }
      }
      work_days: {
        Row: {
          id: string
          user_id: string
          corridor_id: string
          work_date: string
          location: 'home_country' | 'work_country' | 'third_country'
          notes: string | null
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          corridor_id: string
          work_date: string
          location?: 'home_country' | 'work_country' | 'third_country'
          notes?: string | null
          year?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_date?: string
          location?: 'home_country' | 'work_country' | 'third_country'
          notes?: string | null
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          corridor_id: string
          alert_type: 'warning' | 'critical' | 'info'
          threshold_days: number
          current_days: number
          message: string
          is_read: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          corridor_id: string
          alert_type: 'warning' | 'critical' | 'info'
          threshold_days: number
          current_days: number
          message: string
          is_read?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
          sent_at?: string | null
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          corridor: string | null
          problem: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          corridor?: string | null
          problem?: string | null
          created_at?: string
        }
        Update: {
          corridor?: string | null
          problem?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_work_days_count: {
        Args: { p_user_id: string; p_corridor_id: string; p_year: number }
        Returns: number
      }
    }
    Enums: {
      subscription_status: 'free' | 'pro' | 'enterprise'
      work_location: 'home_country' | 'work_country' | 'third_country'
      alert_type: 'warning' | 'critical' | 'info'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Corridor = Database['public']['Tables']['corridors']['Row']
export type WorkDay = Database['public']['Tables']['work_days']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']

export type WorkLocation = 'home_country' | 'work_country' | 'third_country'
export type AlertType = 'warning' | 'critical' | 'info'
export type SubscriptionStatus = 'free' | 'pro' | 'enterprise'
