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
      emergency_contacts: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          relationship: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          relationship?: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          relationship?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      accident_alerts: {
        Row: {
          id: string
          latitude: number
          longitude: number
          severity: string
          status: string
          impact_force: number | null
          alerted_contacts: string[] | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          severity?: string
          status?: string
          impact_force?: number | null
          alerted_contacts?: string[] | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          severity?: string
          status?: string
          impact_force?: number | null
          alerted_contacts?: string[] | null
          created_at?: string
          resolved_at?: string | null
        }
      }
    }
  }
}

export type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row']
export type AccidentAlert = Database['public']['Tables']['accident_alerts']['Row']
