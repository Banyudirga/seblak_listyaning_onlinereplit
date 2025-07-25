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
  stockQuantity: integer("stock_quantity").default(50), // Current stock count
  lowStockThreshold: integer("low_stock_threshold").default(10), // Alert when stock is low
  unit: text("unit").default("porsi"), // "porsi", "gelas", "pcs"
  isAvailable: integer("is_available").default(1), // 1 = available, 0 = unavailable
  rating: integer("rating").default(45),
  reviewCount: integer("review_count").default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  serviceType: text("service_type").notNull(), // "makan ditempat", "diambil", "diantar"
  paymentMethod: text("payment_method").notNull(), // "cash", "bank_transfer", "gopay", "ovo", "dana"
  notes: text("notes"),
  items: json("items").notNull(), // Array of {id, name, price, quantity}
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
