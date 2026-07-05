import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  spicyLevel: text("spicy_level"),
  stockQuantity: integer("stock_quantity").default(50),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  unit: text("unit").default("porsi"),
  isAvailable: integer("is_available").default(1),
  rating: integer("rating").default(45),
  reviewCount: integer("review_count").default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  serviceType: text("service_type").notNull(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
  items: json("items").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplies = pgTable("supplies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  unit: text("unit").notNull().default("pcs"),
  defaultPurchaseUnit: text("default_purchase_unit").notNull().default("pcs"),
  defaultBaseUnitsPerPurchaseUnit: integer("default_base_units_per_purchase_unit").notNull().default(1),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(0),
  supplierName: text("supplier_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplyPurchases = pgTable("supply_purchases", {
  id: serial("id").primaryKey(),
  supplyId: integer("supply_id").notNull(),
  supplierName: text("supplier_name"),
  quantity: integer("quantity").notNull(),
  purchaseUnit: text("purchase_unit").notNull().default("pcs"),
  baseUnitsPerPurchaseUnit: integer("base_units_per_purchase_unit").notNull().default(1),
  convertedQuantity: integer("converted_quantity").notNull().default(0),
  unitCost: integer("unit_cost").notNull(),
  totalCost: integer("total_cost").notNull(),
  notes: text("notes"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const menuItemRecipes = pgTable("menu_item_recipes", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),
  supplyId: integer("supply_id").notNull(),
  quantityRequired: integer("quantity_required").notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  supplyId: integer("supply_id").notNull(),
  movementType: text("movement_type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  unit: text("unit").notNull(),
  referenceType: text("reference_type").notNull(),
  referenceId: integer("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

const baseSupplyUnitSchema = z.string().trim().min(1);

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export const insertSupplySchema = createInsertSchema(supplies)
  .omit({ id: true, createdAt: true })
  .extend({
    unit: baseSupplyUnitSchema,
    defaultPurchaseUnit: z.string().trim().min(1),
    defaultBaseUnitsPerPurchaseUnit: z.number().int().positive(),
    imageUrl: z.string().url().optional().nullable().or(z.literal("")).transform((value) => value || undefined),
    stockQuantity: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0),
  });
export const insertSupplyPurchaseSchema = createInsertSchema(supplyPurchases)
  .omit({ id: true, purchasedAt: true, totalCost: true, convertedQuantity: true })
  .extend({
    quantity: z.number().int().positive(),
    purchaseUnit: z.string().min(1),
    baseUnitsPerPurchaseUnit: z.number().int().positive(),
    unitCost: z.number().int().min(0),
  });
export const insertMenuItemRecipeSchema = createInsertSchema(menuItemRecipes).omit({ id: true });
export const insertSupplyStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true });

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertSupply = z.infer<typeof insertSupplySchema>;
export type Supply = typeof supplies.$inferSelect;
export type InsertSupplyPurchase = z.infer<typeof insertSupplyPurchaseSchema>;
export type SupplyPurchase = typeof supplyPurchases.$inferSelect;
export type InsertMenuItemRecipe = z.infer<typeof insertMenuItemRecipeSchema>;
export type MenuItemRecipe = typeof menuItemRecipes.$inferSelect;
export type InsertSupplyStockMovement = z.infer<typeof insertSupplyStockMovementSchema>;
export type SupplyStockMovement = typeof stockMovements.$inferSelect;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
