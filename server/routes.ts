import type { Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { createHmac, timingSafeEqual } from "crypto";
import multer from "multer";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { supabase } from "./supabase";
import { insertOrderSchema, insertMenuItemSchema, insertSupplySchema, insertSupplyPurchaseSchema, insertMenuItemRecipeSchema } from "@shared/schema";
import { z } from "zod";

const SUPPLY_IMAGE_BUCKET = "supply-images";
const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const supplyImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getCookieValue(req: Request, name: string) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookiePart of cookieHeader.split(";")) {
    const [key, ...valueParts] = cookiePart.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }

  return null;
}

function buildAdminSessionToken(expiresAt: number) {
  const signature = createHmac("sha256", getAdminPassword())
    .update(String(expiresAt))
    .digest("hex");

  return `${expiresAt}.${signature}`;
}

function hasValidAdminSession(req: Request) {
  const adminPassword = getAdminPassword();
  const token = getCookieValue(req, ADMIN_SESSION_COOKIE);
  if (!adminPassword || !token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  const expectedSignature = buildAdminSessionToken(expiresAt).split(".")[1];
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function getAdminCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" as const : "lax" as const,
    maxAge: ADMIN_SESSION_TTL_MS,
    path: "/",
  };
}

const getAdminSession = (req: Request, res: Response) => {
  res.json({ authenticated: hasValidAdminSession(req) });
};

const adminLogin = (req: Request, res: Response) => {
  const adminPassword = getAdminPassword();
  const { password } = req.body ?? {};

  if (!adminPassword) {
    return res.status(500).json({ message: "ADMIN_PASSWORD belum diatur di server." });
  }

  if (typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "Password admin wajib diisi." });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ message: "Password admin salah." });
  }

  res.cookie(ADMIN_SESSION_COOKIE, buildAdminSessionToken(Date.now() + ADMIN_SESSION_TTL_MS), getAdminCookieOptions());
  return res.json({ success: true });
};

const adminLogout = (_req: Request, res: Response) => {
  res.clearCookie(ADMIN_SESSION_COOKIE, getAdminCookieOptions());
  res.json({ success: true });
};

const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (hasValidAdminSession(req)) return next();
  return res.status(401).json({ message: "Akses admin memerlukan login." });
};

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
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create supply" });
    }
  }
};

const uploadSupplyImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    const extension = req.file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `supplies/${Date.now()}-${nanoid(10)}.${extension}`;
    const { error } = await supabase.storage.from(SUPPLY_IMAGE_BUCKET).upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

    if (error) return res.status(500).json({ message: `Failed to upload image: ${error.message}` });

    const { data } = supabase.storage.from(SUPPLY_IMAGE_BUCKET).getPublicUrl(filePath);
    res.status(201).json({ imageUrl: data.publicUrl, path: filePath });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to upload image" });
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

  app.get("/api/admin/session", getAdminSession);
  app.post("/api/admin/login", adminLogin);
  app.post("/api/admin/logout", adminLogout);
  app.use("/api/admin", requireAdminAuth);

  // --- Admin API Routes ---
  app.get("/api/admin/orders", getAllOrders);
  app.patch("/api/admin/orders/:id/status", adminUpdateOrderStatus);
  app.get("/api/admin/inventory", getAllMenuItems);
  app.post("/api/admin/inventory", createMenuItem);
  app.patch("/api/admin/inventory/:id", updateMenuItemStock);
  app.patch("/api/admin/inventory/:id/availability", updateMenuItemAvailability);
  app.get("/api/admin/supplies", getAllSupplies);
  app.post("/api/admin/uploads/supply-image", supplyImageUpload.single("file"), uploadSupplyImage);
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
