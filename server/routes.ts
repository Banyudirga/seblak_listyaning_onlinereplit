import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

// --- Reusable Route Handlers ---

const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await storage.getAllMenuItems();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

const getMenuItemsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const menuItems = await storage.getMenuItemsByCategory(category);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items by category" });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedOrder = insertOrderSchema.parse(req.body);
    const order = await storage.createOrder(validatedOrder);
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid order data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create order" });
    }
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await storage.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const order = await storage.updateOrderStatus(id, status);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await storage.updateOrderStatus(id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMenuItemStock = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { stockQuantity, lowStockThreshold } = req.body;
    
    if (typeof stockQuantity !== 'number' || typeof lowStockThreshold !== 'number') {
      return res.status(400).json({ error: "Stock quantities must be numbers" });
    }

    if (stockQuantity < 0 || lowStockThreshold < 1) {
      return res.status(400).json({ error: "Invalid stock values" });
    }

    const item = await storage.updateMenuItemStock(id, stockQuantity, lowStockThreshold);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMenuItemAvailability = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'number' || (isAvailable !== 0 && isAvailable !== 1)) {
      return res.status(400).json({ error: "isAvailable must be 0 or 1" });
    }

    const item = await storage.updateMenuItemAvailability(id, isAvailable);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Public API Routes ---
  app.get("/api/menu", getAllMenuItems);
  app.get("/api/menu/category/:category", getMenuItemsByCategory);
  app.post("/api/orders", createOrder);
  app.get("/api/orders/:id", getOrderById);
  app.get("/api/orders", getAllOrders);
  app.patch("/api/orders/:id/status", updateOrderStatus);

  // --- Admin API Routes ---
  app.get("/api/admin/orders", getAllOrders); // Reuse handler
  app.patch("/api/admin/orders/:id/status", adminUpdateOrderStatus);
  app.get("/api/admin/inventory", getAllMenuItems); // Reuse handler
  app.patch("/api/admin/inventory/:id", updateMenuItemStock);
  app.patch("/api/admin/inventory/:id/availability", updateMenuItemAvailability);

  const httpServer = createServer(app);
  return httpServer;
}
