// Import environment variables first
import './env';

import { type MenuItem, type Order, type InsertOrder, type InsertMenuItem, type Supply, type InsertSupply, type SupplyPurchase, type InsertSupplyPurchase, type MenuItemRecipe, type InsertMenuItemRecipe, type SupplyStockMovement, type InsertSupplyStockMovement } from "@shared/schema";
import { defaultMenuItems } from "./mock-data";

export interface RecipeCoverageSummary {
  menuItemId: number;
  ingredientCount: number;
}

export interface IStorage {
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItemStock(id: number, stockQuantity: number, lowStockThreshold: number): Promise<MenuItem | undefined>;
  updateMenuItemAvailability(id: number, isAvailable: number): Promise<MenuItem | undefined>;
  getAllSupplies(): Promise<Supply[]>;
  createSupply(supply: InsertSupply): Promise<Supply>;
  createSupplyPurchase(purchase: InsertSupplyPurchase): Promise<SupplyPurchase>;
  getAllSupplyPurchases(): Promise<SupplyPurchase[]>;
  getSupplyStockMovements(): Promise<SupplyStockMovement[]>;
  getRecipesByMenuItem(menuItemId: number): Promise<MenuItemRecipe[]>;
  getRecipeCoverageSummaries(): Promise<RecipeCoverageSummary[]>;
  replaceMenuItemRecipe(menuItemId: number, recipes: InsertMenuItemRecipe[]): Promise<MenuItemRecipe[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private supplies: Map<number, Supply>;
  private supplyPurchases: Map<number, SupplyPurchase>;
  private stockMovements: Map<number, SupplyStockMovement>;
  private recipes: Map<number, MenuItemRecipe>;
  private currentMenuId: number;
  private currentOrderId: number;
  private currentSupplyId: number;
  private currentSupplyPurchaseId: number;
  private currentStockMovementId: number;
  private currentRecipeId: number;

  constructor() {
    this.menuItems = new Map();
    this.orders = new Map();
    this.supplies = new Map();
    this.supplyPurchases = new Map();
    this.stockMovements = new Map();
    this.recipes = new Map();
    this.currentMenuId = 1;
    this.currentOrderId = 1;
    this.currentSupplyId = 1;
    this.currentSupplyPurchaseId = 1;
    this.currentStockMovementId = 1;
    this.currentRecipeId = 1;
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
      id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      image: menuItem.image,
      spicyLevel: menuItem.spicyLevel ?? null,
      stockQuantity: menuItem.stockQuantity ?? 50,
      lowStockThreshold: menuItem.lowStockThreshold ?? 10,
      unit: menuItem.unit ?? "porsi",
      isAvailable: menuItem.isAvailable ?? 1,
      rating: menuItem.rating ?? 45,
      reviewCount: menuItem.reviewCount ?? 0,
    };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }

  async getAllSupplies(): Promise<Supply[]> {
    return Array.from(this.supplies.values());
  }

  async createSupply(supply: InsertSupply): Promise<Supply> {
    const newSupply: Supply = {
      id: this.currentSupplyId++,
      name: supply.name,
      imageUrl: supply.imageUrl ?? null,
      unit: supply.unit ?? "pcs",
      defaultPurchaseUnit: supply.defaultPurchaseUnit ?? supply.unit ?? "pcs",
      defaultBaseUnitsPerPurchaseUnit: supply.defaultBaseUnitsPerPurchaseUnit ?? 1,
      stockQuantity: supply.stockQuantity ?? 0,
      lowStockThreshold: supply.lowStockThreshold ?? 0,
      supplierName: supply.supplierName ?? null,
      createdAt: new Date(),
    };
    this.supplies.set(newSupply.id, newSupply);
    return newSupply;
  }

  async createSupplyPurchase(purchase: InsertSupplyPurchase): Promise<SupplyPurchase> {
    const supply = this.supplies.get(purchase.supplyId);
    if (!supply) throw new Error("Supply not found");
    if (purchase.quantity <= 0) throw new Error("Purchase quantity must be greater than 0");
    if (purchase.baseUnitsPerPurchaseUnit <= 0) throw new Error("Conversion to base units must be greater than 0");
    if (purchase.unitCost < 0) throw new Error("Unit cost cannot be negative");

    const convertedQuantity = purchase.quantity * purchase.baseUnitsPerPurchaseUnit;
    supply.stockQuantity += convertedQuantity;
    this.supplies.set(supply.id, supply);

    const newPurchase: SupplyPurchase = {
      id: this.currentSupplyPurchaseId++,
      supplyId: purchase.supplyId,
      supplierName: purchase.supplierName ?? null,
      quantity: purchase.quantity,
      purchaseUnit: purchase.purchaseUnit ?? supply.unit,
      baseUnitsPerPurchaseUnit: purchase.baseUnitsPerPurchaseUnit ?? 1,
      convertedQuantity,
      unitCost: purchase.unitCost,
      totalCost: purchase.quantity * purchase.unitCost,
      notes: purchase.notes ?? null,
      purchasedAt: new Date(),
    };
    this.supplyPurchases.set(newPurchase.id, newPurchase);
    this.recordStockMovement({ supplyId: supply.id, movementType: "purchase", quantityChange: convertedQuantity, unit: supply.unit, referenceType: "purchase", referenceId: newPurchase.id, notes: newPurchase.notes ?? `Purchase recorded for ${supply.name}` });
    return newPurchase;
  }

  async getAllSupplyPurchases(): Promise<SupplyPurchase[]> {
    return Array.from(this.supplyPurchases.values());
  }

  private recordStockMovement(movement: InsertSupplyStockMovement): SupplyStockMovement {
    const created = { ...movement, id: this.currentStockMovementId++, referenceId: movement.referenceId ?? null, notes: movement.notes ?? null, createdAt: new Date() };
    this.stockMovements.set(created.id, created);
    return created;
  }

  async getSupplyStockMovements(): Promise<SupplyStockMovement[]> {
    return Array.from(this.stockMovements.values()).sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
  }

  async getRecipesByMenuItem(menuItemId: number): Promise<MenuItemRecipe[]> {
    return Array.from(this.recipes.values()).filter((recipe) => recipe.menuItemId === menuItemId);
  }

  async getRecipeCoverageSummaries(): Promise<RecipeCoverageSummary[]> {
    const counts = new Map<number, number>();
    for (const recipe of this.recipes.values()) {
      counts.set(recipe.menuItemId, (counts.get(recipe.menuItemId) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([menuItemId, ingredientCount]) => ({ menuItemId, ingredientCount }));
  }

  async replaceMenuItemRecipe(menuItemId: number, recipes: InsertMenuItemRecipe[]): Promise<MenuItemRecipe[]> {
    for (const [key, value] of Array.from(this.recipes.entries())) {
      if (value.menuItemId === menuItemId) this.recipes.delete(key);
    }

    const createdRecipes = recipes.map((recipe) => {
      const newRecipe: MenuItemRecipe = {
        id: this.currentRecipeId++,
        menuItemId,
        supplyId: recipe.supplyId,
        quantityRequired: recipe.quantityRequired,
      };
      this.recipes.set(newRecipe.id, newRecipe);
      return newRecipe;
    });

    return createdRecipes;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      id,
      customerName: insertOrder.customerName,
      customerPhone: insertOrder.customerPhone,
      customerAddress: insertOrder.customerAddress,
      serviceType: insertOrder.serviceType,
      paymentMethod: insertOrder.paymentMethod,
      notes: insertOrder.notes ?? null,
      items: insertOrder.items,
      totalAmount: insertOrder.totalAmount,
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

  private isDeductionStatus(status: string) {
    return ["confirmed", "preparing", "ready", "delivered"].includes(status);
  }

  private async deductSupplyStockForOrder(order: Order) {
    const items = Array.isArray(order.items) ? (order.items as Array<{ id: number; quantity: number; name?: string }>) : [];
    for (const item of items) {
      const recipes = await this.getRecipesByMenuItem(item.id);
      if (recipes.length === 0) throw new Error(`Recipe not configured for ${item.name ?? `menu item #${item.id}`}`);
      for (const recipe of recipes) {
        const supply = this.supplies.get(recipe.supplyId);
        if (!supply) throw new Error(`Supply #${recipe.supplyId} not found`);
        const required = recipe.quantityRequired * item.quantity;
        if (supply.stockQuantity < required) throw new Error(`Not enough stock for ${supply.name}`);
        supply.stockQuantity -= required;
        this.supplies.set(supply.id, supply);
        this.recordStockMovement({ supplyId: supply.id, movementType: "usage", quantityChange: -required, unit: supply.unit, referenceType: "order", referenceId: order.id, notes: item.name ? `${item.name} x${item.quantity}` : `Order #${order.id}` });
      }
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const shouldDeduct = this.isDeductionStatus(status) && !this.isDeductionStatus(order.status);
    if (shouldDeduct) await this.deductSupplyStockForOrder(order);

    order.status = status;
    this.orders.set(id, order);
    return order;
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

  // Use SupabaseStorage if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided, otherwise fallback to MemStorage
  const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Log which storage implementation is being used
  console.log('Environment variables when initializing storage:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[REDACTED]' : undefined,
    useSupabase
  });

  // Initialize the appropriate storage implementation
  storageInstance = useSupabase ? new SupabaseStorage() : new MemStorage();
  console.log('Using storage implementation:', useSupabase ? 'SupabaseStorage' : 'MemStorage');
  return storageInstance;
};

// For backward compatibility
export const storage = getStorage();
