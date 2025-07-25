// Import environment variables first
import './env';

import { type MenuItem, type Order, type InsertOrder, type InsertMenuItem } from "@shared/schema";
import { defaultMenuItems } from "./mock-data";

export interface IStorage {
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItemStock(id: number, stockQuantity: number, lowStockThreshold: number): Promise<MenuItem | undefined>;
  updateMenuItemAvailability(id: number, isAvailable: number): Promise<MenuItem | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private currentMenuId: number;
  private currentOrderId: number;

  constructor() {
    this.menuItems = new Map();
    this.orders = new Map();
    this.currentMenuId = 1;
    this.currentOrderId = 1;
    this.initializeMenuItems();
  }

  private initializeMenuItems() {
    defaultMenuItems.forEach(item => {
      const menuItem: MenuItem = { ...item, id: this.currentMenuId++ };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.category === category);
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuId++;
    const newMenuItem: MenuItem = {
      ...menuItem,
      id,
      rating: menuItem.rating || 45,
      reviewCount: menuItem.reviewCount || 0
    };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  async updateMenuItemStock(id: number, stockQuantity: number, lowStockThreshold: number): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (item) {
      item.stockQuantity = stockQuantity;
      item.lowStockThreshold = lowStockThreshold;
      this.menuItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async updateMenuItemAvailability(id: number, isAvailable: number): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (item) {
      item.isAvailable = isAvailable;
      this.menuItems.set(id, item);
      return item;
    }
    return undefined;
  }
}

// Import the SupabaseStorage implementation
import { SupabaseStorage } from "./supabase-storage";

// Create a storage instance variable
let storageInstance: IStorage | null = null;

// Function to get or initialize the storage
export const getStorage = (): IStorage => {
  if (storageInstance) {
    return storageInstance;
  }

  // Use SupabaseStorage if SUPABASE_URL and SUPABASE_KEY are provided, otherwise fallback to MemStorage
  const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

  // Log which storage implementation is being used
  console.log('Environment variables when initializing storage:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY ? '[REDACTED]' : undefined,
    useSupabase
  });

  // Initialize the appropriate storage implementation
  storageInstance = useSupabase ? new SupabaseStorage() : new MemStorage();
  console.log('Using storage implementation:', useSupabase ? 'SupabaseStorage' : 'MemStorage');
  return storageInstance;
};

// For backward compatibility
export const storage = getStorage();
