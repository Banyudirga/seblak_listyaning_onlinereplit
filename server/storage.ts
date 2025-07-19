import { menuItems, orders, type MenuItem, type Order, type InsertOrder, type InsertMenuItem } from "@shared/schema";

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
    const defaultMenuItems: Omit<MenuItem, 'id'>[] = [
      {
        name: "Seblak Kerupuk Original",
        description: "Seblak dengan kerupuk, telur, dan sayuran segar dengan bumbu rahasia khas Listyaning",
        price: 15000,
        category: "seblak",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Pedas",
        stockQuantity: 25,
        lowStockThreshold: 5,
        unit: "porsi",
        isAvailable: 1,
        rating: 48,
        reviewCount: 124
      },
      {
        name: "Seblak Seafood Spesial",
        description: "Seblak premium dengan udang, cumi, telur, dan topping lengkap yang bikin nagih",
        price: 25000,
        category: "seblak",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d925?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Spesial",
        stockQuantity: 15,
        lowStockThreshold: 3,
        unit: "porsi",
        isAvailable: 1,
        rating: 49,
        reviewCount: 89
      },
      {
        name: "Seblak Telur Sayuran",
        description: "Seblak dengan telur rebus, sayuran segar, cocok untuk yang tidak suka pedas",
        price: 12000,
        category: "seblak",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Tidak Pedas",
        stockQuantity: 30,
        lowStockThreshold: 8,
        unit: "porsi",
        isAvailable: 1,
        rating: 47,
        reviewCount: 67
      },
      {
        name: "Seblak Keju Mozarella",
        description: "Seblak dengan keju mozarella yang meleleh, perpaduan gurih dan pedas yang sempurna",
        price: 20000,
        category: "seblak",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Keju",
        stockQuantity: 8,
        lowStockThreshold: 5,
        unit: "porsi",
        isAvailable: 1,
        rating: 48,
        reviewCount: 95
      },
      {
        name: "Es Teh Manis",
        description: "Teh manis dingin yang menyegarkan, cocok untuk menemani seblak pedas",
        price: 5000,
        category: "minuman",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Dingin",
        stockQuantity: 50,
        lowStockThreshold: 15,
        unit: "gelas",
        isAvailable: 1,
        rating: 46,
        reviewCount: 45
      },
      {
        name: "Ayam Goreng Crispy",
        description: "Ayam goreng crispy dengan bumbu rahasia, cocok sebagai lauk tambahan atau makanan utama",
        price: 18000,
        category: "makanan",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Gurih",
        stockQuantity: 12,
        lowStockThreshold: 5,
        unit: "porsi",
        isAvailable: 1,
        rating: 47,
        reviewCount: 78
      },
      {
        name: "Kerupuk Mentah",
        description: "Kerupuk mentah berkualitas untuk pelengkap seblak atau cemilan dirumah",
        price: 8000,
        category: "cemilan",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        spicyLevel: "Cemilan",
        stockQuantity: 25,
        lowStockThreshold: 10,
        unit: "pack",
        isAvailable: 1,
        rating: 45,
        reviewCount: 32
      }
    ];

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
