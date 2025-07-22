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
      menu_items: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category: string
          image: string
          spicy_level: string | null
          stock_quantity: number | null
          low_stock_threshold: number | null
          unit: string | null
          is_available: number | null
          rating: number | null
          review_count: number | null
        }
        Insert: {
          id?: number
          name: string
          description: string
          price: number
          category: string
          image: string
          spicy_level?: string | null
          stock_quantity?: number | null
          low_stock_threshold?: number | null
          unit?: string | null
          is_available?: number | null
          rating?: number | null
          review_count?: number | null
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          category?: string
          image?: string
          spicy_level?: string | null
          stock_quantity?: number | null
          low_stock_threshold?: number | null
          unit?: string | null
          is_available?: number | null
          rating?: number | null
          review_count?: number | null
        }
      }
      orders: {
        Row: {
          id: number
          customer_name: string
          customer_phone: string
          customer_address: string
          service_type: string
          payment_method: string
          notes: string | null
          items: Json
          total_amount: number
          status: string
          created_at: string | null
        }
        Insert: {
          id?: number
          customer_name: string
          customer_phone: string
          customer_address: string
          service_type: string
          payment_method: string
          notes?: string | null
          items: Json
          total_amount: number
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: number
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          service_type?: string
          payment_method?: string
          notes?: string | null
          items?: Json
          total_amount?: number
          status?: string
          created_at?: string | null
        }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}