import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertMenuItemSchema, insertSupplySchema, insertSupplyPurchaseSchema, insertMenuItemRecipeSchema } from "@shared/schema";
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
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let order;
    try {
      order = await storage.updateOrderStatus(id, status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
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

const createMenuItem = async (req: Request, res: Response) => {
  try {
    const validatedMenuItem = insertMenuItemSchema.parse(req.body);
    const menuItem = await storage.createMenuItem(validatedMenuItem);
    res.status(201).json(menuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
    } else {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  }
};

const getAllSupplies = async (_req: Request, res: Response) => {
  try {
    const supplies = await storage.getAllSupplies();
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplies" });
  }
};

const createSupply = async (req: Request, res: Response) => {
  try {
    const validatedSupply = insertSupplySchema.parse(req.body);
    const supply = await storage.createSupply(validatedSupply);
    res.status(201).json(supply);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid supply data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create supply" });
    }
  }
};

const getAllSupplyPurchases = async (_req: Request, res: Response) => {
  try {
    const purchases = await storage.getAllSupplyPurchases();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supply purchases" });
  }
};

const getStockMovements = async (_req: Request, res: Response) => {
  try {
    const movements = await storage.getSupplyStockMovements();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock movements" });
  }
};

const createSupplyPurchase = async (req: Request, res: Response) => {
  try {
    const validatedPurchase = insertSupplyPurchaseSchema.parse(req.body);
    const purchase = await storage.createSupplyPurchase(validatedPurchase);
    res.status(201).json(purchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid supply purchase data", errors: error.errors });
    } else {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create supply purchase" });
    }
  }
};

const getMenuItemRecipes = async (req: Request, res: Response) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);
    const recipes = await storage.getRecipesByMenuItem(menuItemId);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu item recipes" });
  }
};

const getRecipeCoverageSummaries = async (_req: Request, res: Response) => {
  try {
    const summary = await storage.getRecipeCoverageSummaries();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipe coverage summary" });
  }
};

const replaceMenuItemRecipes = async (req: Request, res: Response) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);
    const payload = z.array(insertMenuItemRecipeSchema).parse(
      req.body.map((recipe: z.infer<typeof insertMenuItemRecipeSchema>) => ({ ...recipe, menuItemId }))
    );
    const recipes = await storage.replaceMenuItemRecipe(menuItemId, payload);
    res.json(recipes);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to replace menu item recipes" });
    }
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
  app.get("/api/admin/orders", getAllOrders);
  app.patch("/api/admin/orders/:id/status", adminUpdateOrderStatus);
  app.get("/api/admin/inventory", getAllMenuItems);
  app.post("/api/admin/inventory", createMenuItem);
  app.patch("/api/admin/inventory/:id", updateMenuItemStock);
  app.patch("/api/admin/inventory/:id/availability", updateMenuItemAvailability);
  app.get("/api/admin/supplies", getAllSupplies);
  app.post("/api/admin/supplies", createSupply);
  app.get("/api/admin/supply-purchases", getAllSupplyPurchases);
  app.post("/api/admin/supply-purchases", createSupplyPurchase);
  app.get("/api/admin/stock-movements", getStockMovements);
  app.get("/api/admin/recipes/summary", getRecipeCoverageSummaries);
  app.get("/api/admin/menu-items/:menuItemId/recipes", getMenuItemRecipes);
  app.put("/api/admin/menu-items/:menuItemId/recipes", replaceMenuItemRecipes);

  const httpServer = createServer(app);
  return httpServer;
}
