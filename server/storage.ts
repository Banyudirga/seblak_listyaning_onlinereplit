import { menuItems, orders, type MenuItem, type Order, type InsertOrder, type InsertMenuItem } from "@shared/schema";
import { defaultMenuItems } from "./mock-data";

export interface IStorage {
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
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

export const storage = new MemStorage();
