import { type MenuItem, type Order, type InsertOrder, type InsertMenuItem, type Supply, type InsertSupply, type SupplyPurchase, type InsertSupplyPurchase, type MenuItemRecipe, type InsertMenuItemRecipe, type SupplyStockMovement } from "@shared/schema";
import { supabase } from "./supabase";
import { IStorage } from "./storage";
import { defaultMenuItems } from "./mock-data";

export class SupabaseStorage implements IStorage {
  constructor() {
    this.initializeMenuItems();
  }

  private mapSupply(data: any): Supply {
    return {
      id: data.id,
      name: data.name,
      imageUrl: data.image_url,
      unit: data.unit,
      stockQuantity: data.stock_quantity,
      lowStockThreshold: data.low_stock_threshold,
      supplierName: data.supplier_name,
      createdAt: new Date(data.created_at)
    };
  }

  private mapRecipe(data: any): MenuItemRecipe {
    return {
      id: data.id,
      menuItemId: data.menu_item_id,
      supplyId: data.supply_id,
      quantityRequired: data.quantity_required
    };
  }

  private mapStockMovement(data: any): SupplyStockMovement {
    return {
      id: data.id,
      supplyId: data.supply_id,
      movementType: data.movement_type,
      quantityChange: data.quantity_change,
      unit: data.unit,
      referenceType: data.reference_type,
      referenceId: data.reference_id,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    };
  }
  
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        category: menuItem.category,
        image: menuItem.image,
        spicy_level: menuItem.spicyLevel,
        stock_quantity: menuItem.stockQuantity,
        low_stock_threshold: menuItem.lowStockThreshold,
        unit: menuItem.unit,
        is_available: menuItem.isAvailable,
        rating: menuItem.rating || 45,
        review_count: menuItem.reviewCount || 0
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      throw new Error(`Failed to create menu item: ${error.message}`);
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

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    return undefined;
  }

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

private isDeductionStatus(status: string) {
  return ['confirmed', 'preparing', 'ready', 'delivered'].includes(status);
}

private async getRequiredSupplyUsage(order: Order) {
  const items = Array.isArray(order.items)
    ? (order.items as Array<{ id: number; quantity: number; name?: string }>)
    : [];
  const usage = new Map<number, number>();

  for (const item of items) {
    const recipes = await this.getRecipesByMenuItem(item.id);
    if (recipes.length === 0) throw new Error(`Recipe not configured for ${item.name ?? `menu item #${item.id}`}`);
    for (const recipe of recipes) {
      usage.set(recipe.supplyId, (usage.get(recipe.supplyId) ?? 0) + recipe.quantityRequired * item.quantity);
    }
  }

  return usage;
}

private async deductStockForOrder(order: Order): Promise<void> {
  const usage = await this.getRequiredSupplyUsage(order);

  for (const [supplyId, required] of usage.entries()) {
    const { data: supply, error } = await supabase.from('supplies').select('*').eq('id', supplyId).single();
    if (error || !supply) throw new Error(`Supply #${supplyId} not found`);
    if (supply.stock_quantity < required) throw new Error(`Not enough stock for ${supply.name}`);

    const { error: updateError } = await supabase
      .from('supplies')
      .update({ stock_quantity: supply.stock_quantity - required })
      .eq('id', supplyId);

    if (updateError) throw new Error(updateError.message || `Failed to deduct stock for ${supply.name}`);

    const { error: movementError } = await supabase.from('stock_movements').insert({
      supply_id: supplyId,
      movement_type: 'usage',
      quantity_change: -required,
      unit: supply.unit,
      reference_type: 'order',
      reference_id: order.id,
      notes: `Stock deducted for order #${order.id}`
    });

    if (movementError) throw new Error(movementError.message || `Failed to log usage for ${supply.name}`);
  }
}

async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
  const existingOrder = await this.getOrder(id);
  if (!existingOrder) return undefined;

  const shouldDeduct = this.isDeductionStatus(status) && !this.isDeductionStatus(existingOrder.status);
  if (shouldDeduct) await this.deductStockForOrder(existingOrder);

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Failed to update order status');

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
      .update({ is_available: isAvailable })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return undefined;

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

  async getAllSupplies(): Promise<Supply[]> {
    const { data, error } = await supabase.from('supplies').select('*').order('name');
    if (error) return [];
    return data.map((item) => this.mapSupply(item));
  }

  async createSupply(supply: InsertSupply): Promise<Supply> {
    const baseInsert = {
      name: supply.name,
      unit: supply.unit,
      stock_quantity: supply.stockQuantity,
      low_stock_threshold: supply.lowStockThreshold,
      supplier_name: supply.supplierName,
    };

    let result = await supabase
      .from('supplies')
      .insert({
        ...baseInsert,
        image_url: supply.imageUrl,
      })
      .select('*')
      .single();

    if (result.error && /image_url|column/i.test(result.error.message)) {
      result = await supabase
        .from('supplies')
        .insert(baseInsert)
        .select('*')
        .single();
    }

    if (result.error) throw new Error(`Failed to create supply: ${result.error.message}`);
    return this.mapSupply(result.data);
  }

  async createSupplyPurchase(purchase: InsertSupplyPurchase): Promise<SupplyPurchase> {
    if (purchase.quantity <= 0) throw new Error('Purchase quantity must be greater than 0');
    if (purchase.baseUnitsPerPurchaseUnit <= 0) throw new Error('Conversion to base units must be greater than 0');
    if (purchase.unitCost < 0) throw new Error('Unit cost cannot be negative');

    const totalCost = purchase.quantity * purchase.unitCost;
    const { data: supply } = await supabase.from('supplies').select('*').eq('id', purchase.supplyId).single();
    if (!supply) throw new Error('Supply not found');

    const convertedQuantity = purchase.quantity * purchase.baseUnitsPerPurchaseUnit;
    const { data, error } = await supabase
      .from('supply_purchases')
      .insert({
        supply_id: purchase.supplyId,
        supplier_name: purchase.supplierName,
        quantity: purchase.quantity,
        purchase_unit: purchase.purchaseUnit ?? supply.unit,
        base_units_per_purchase_unit: purchase.baseUnitsPerPurchaseUnit ?? 1,
        converted_quantity: convertedQuantity,
        unit_cost: purchase.unitCost,
        total_cost: totalCost,
        notes: purchase.notes
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create supply purchase: ${error.message}`);

    const { error: supplyUpdateError } = await supabase
      .from('supplies')
      .update({ stock_quantity: supply.stock_quantity + convertedQuantity })
      .eq('id', purchase.supplyId);

    if (supplyUpdateError) throw new Error(`Failed to update supply stock: ${supplyUpdateError.message}`);

    const { error: movementError } = await supabase.from('stock_movements').insert({
      supply_id: purchase.supplyId,
      movement_type: 'purchase',
      quantity_change: convertedQuantity,
      unit: supply.unit,
      reference_type: 'purchase',
      reference_id: data.id,
      notes: purchase.notes ?? `Purchase recorded for ${supply.name}`
    });

    if (movementError) throw new Error(`Failed to log stock movement: ${movementError.message}`);

    return {
      id: data.id,
      supplyId: data.supply_id,
      supplierName: data.supplier_name,
      quantity: data.quantity,
      purchaseUnit: data.purchase_unit,
      baseUnitsPerPurchaseUnit: data.base_units_per_purchase_unit,
      convertedQuantity: data.converted_quantity,
      unitCost: data.unit_cost,
      totalCost: data.total_cost,
      notes: data.notes,
      purchasedAt: new Date(data.purchased_at)
    };
  }

  async getAllSupplyPurchases(): Promise<SupplyPurchase[]> {
    const { data, error } = await supabase.from('supply_purchases').select('*').order('purchased_at', { ascending: false });
    if (error) return [];
    return data.map((item) => ({
      id: item.id,
      supplyId: item.supply_id,
      supplierName: item.supplier_name,
      quantity: item.quantity,
      purchaseUnit: item.purchase_unit,
      baseUnitsPerPurchaseUnit: item.base_units_per_purchase_unit,
      convertedQuantity: item.converted_quantity,
      unitCost: item.unit_cost,
      totalCost: item.total_cost,
      notes: item.notes,
      purchasedAt: new Date(item.purchased_at)
    }));
  }

  async getSupplyStockMovements(): Promise<SupplyStockMovement[]> {
    const { data, error } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(100);
    if (error || !data) return [];
    return data.map((item) => this.mapStockMovement(item));
  }

  async getRecipesByMenuItem(menuItemId: number): Promise<MenuItemRecipe[]> {
    const { data, error } = await supabase.from('menu_item_recipes').select('*').eq('menu_item_id', menuItemId);
    if (error) return [];
    return data.map((item) => this.mapRecipe(item));
  }

  async getRecipeCoverageSummaries(): Promise<Array<{ menuItemId: number; ingredientCount: number }>> {
    const { data, error } = await supabase.from('menu_item_recipes').select('menu_item_id');
    if (error || !data) return [];

    const counts = new Map<number, number>();
    for (const row of data) {
      counts.set(row.menu_item_id, (counts.get(row.menu_item_id) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([menuItemId, ingredientCount]) => ({ menuItemId, ingredientCount }));
  }

  async replaceMenuItemRecipe(menuItemId: number, recipes: InsertMenuItemRecipe[]): Promise<MenuItemRecipe[]> {
    await supabase.from('menu_item_recipes').delete().eq('menu_item_id', menuItemId);
    if (recipes.length === 0) return [];

    const { data, error } = await supabase
      .from('menu_item_recipes')
      .insert(recipes.map((recipe) => ({
        menu_item_id: menuItemId,
        supply_id: recipe.supplyId,
        quantity_required: recipe.quantityRequired
      })))
      .select('*');

    if (error) throw new Error(`Failed to replace recipe: ${error.message}`);
    return data.map((item) => this.mapRecipe(item));
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
}