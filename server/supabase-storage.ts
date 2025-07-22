import { type MenuItem, type Order, type InsertOrder, type InsertMenuItem } from "@shared/schema";
import { supabase } from "./supabase";
import { IStorage } from "./storage";
import { defaultMenuItems } from "./mock-data";

export class SupabaseStorage implements IStorage {
  constructor() {
    // Initialize the database with default menu items if needed
    this.initializeMenuItems();
  }

  private async initializeMenuItems() {
    // Check if menu items already exist
    const { data: existingItems, error: checkError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking for existing menu items:', checkError);
      return;
    }

    // If no items exist, insert the default ones
    if (!existingItems || existingItems.length === 0) {
      for (const item of defaultMenuItems) {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            spicy_level: item.spicyLevel,
            stock_quantity: item.stockQuantity,
            low_stock_threshold: item.lowStockThreshold,
            unit: item.unit,
            is_available: item.isAvailable,
            rating: item.rating,
            review_count: item.reviewCount
          });

        if (error) {
          console.error(`Error inserting menu item ${item.name}:`, error);
        }
      }
      console.log('Default menu items inserted successfully');
    }
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*');

    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }

    // Transform the data to match the MenuItem type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      spicyLevel: item.spicy_level,
      stockQuantity: item.stock_quantity,
      lowStockThreshold: item.low_stock_threshold,
      unit: item.unit,
      isAvailable: item.is_available,
      rating: item.rating,
      reviewCount: item.review_count
    }));
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category);

    if (error) {
      console.error(`Error fetching menu items for category ${category}:`, error);
      return [];
    }

    // Transform the data to match the MenuItem type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      spicyLevel: item.spicy_level,
      stockQuantity: item.stock_quantity,
      lowStockThreshold: item.low_stock_threshold,
      unit: item.unit,
      isAvailable: item.is_available,
      rating: item.rating,
      reviewCount: item.review_count
    }));
  }

  async updateMenuItemStock(id: number, stockQuantity: number, lowStockThreshold: number): Promise<MenuItem | undefined> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error(`Error updating stock for menu item ${id}:`, error);
      return undefined;
    }

    // Transform the data to match the MenuItem type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      spicyLevel: data.spicy_level,
      stockQuantity: data.stock_quantity,
      lowStockThreshold: data.low_stock_threshold,
      unit: data.unit,
      isAvailable: data.is_available,
      rating: data.rating,
      reviewCount: data.review_count
    };
  }

  async updateMenuItemAvailability(id: number, isAvailable: number): Promise<MenuItem | undefined> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        is_available: isAvailable
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error(`Error updating availability for menu item ${id}:`, error);
      return undefined;
    }

    // Transform the data to match the MenuItem type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      spicyLevel: data.spicy_level,
      stockQuantity: data.stock_quantity,
      lowStockThreshold: data.low_stock_threshold,
      unit: data.unit,
      isAvailable: data.is_available,
      rating: data.rating,
      reviewCount: data.review_count
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        service_type: order.serviceType,
        payment_method: order.paymentMethod,
        notes: order.notes,
        items: order.items,
        total_amount: order.totalAmount,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    // Transform the data to match the Order type
    return {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerAddress: data.customer_address,
      serviceType: data.service_type,
      paymentMethod: data.payment_method,
      notes: data.notes,
      items: data.items,
      totalAmount: data.total_amount,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching order ${id}:`, error);
      return undefined;
    }

    // Transform the data to match the Order type
    return {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerAddress: data.customer_address,
      serviceType: data.service_type,
      paymentMethod: data.payment_method,
      notes: data.notes,
      items: data.items,
      totalAmount: data.total_amount,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    // Transform the data to match the Order type
    return data.map(order => ({
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      serviceType: order.service_type,
      paymentMethod: order.payment_method,
      notes: order.notes,
      items: order.items,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: new Date(order.created_at)
    }));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: status
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error(`Error updating status for order ${id}:`, error);
      return undefined;
    }

    // Transform the data to match the Order type
    return {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerAddress: data.customer_address,
      serviceType: data.service_type,
      paymentMethod: data.payment_method,
      notes: data.notes,
      items: data.items,
      totalAmount: data.total_amount,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }
}