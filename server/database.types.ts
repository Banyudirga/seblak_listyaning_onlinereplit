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
      supplies: {
        Row: {
          id: number
          name: string
          unit: string
          stock_quantity: number
          low_stock_threshold: number
          supplier_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          unit?: string
          stock_quantity?: number
          low_stock_threshold?: number
          supplier_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          unit?: string
          stock_quantity?: number
          low_stock_threshold?: number
          supplier_name?: string | null
          created_at?: string | null
        }
      }
      supply_purchases: {
        Row: {
          id: number
          supply_id: number
          supplier_name: string | null
          quantity: number
          purchase_unit: string
          base_units_per_purchase_unit: number
          converted_quantity: number
          unit_cost: number
          total_cost: number
          notes: string | null
          purchased_at: string | null
        }
        Insert: {
          id?: number
          supply_id: number
          supplier_name?: string | null
          quantity: number
          purchase_unit?: string
          base_units_per_purchase_unit?: number
          converted_quantity?: number
          unit_cost: number
          total_cost: number
          notes?: string | null
          purchased_at?: string | null
        }
        Update: {
          id?: number
          supply_id?: number
          supplier_name?: string | null
          quantity?: number
          purchase_unit?: string
          base_units_per_purchase_unit?: number
          converted_quantity?: number
          unit_cost?: number
          total_cost?: number
          notes?: string | null
          purchased_at?: string | null
        }
      }
      menu_item_recipes: {
        Row: {
          id: number
          menu_item_id: number
          supply_id: number
          quantity_required: number
        }
        Insert: {
          id?: number
          menu_item_id: number
          supply_id: number
          quantity_required: number
        }
        Update: {
          id?: number
          menu_item_id?: number
          supply_id?: number
          quantity_required?: number
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