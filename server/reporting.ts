import type { MenuItem, Order, Supply, SupplyPurchase, SupplyStockMovement } from "@shared/schema";
import type { IStorage } from "./storage";

const SALES_STATUSES = new Set(["confirmed", "preparing", "ready", "delivered"]);

export type ReportDateRange = {
  startDate: Date | null;
  endDate: Date | null;
  startDateText?: string;
  endDateText?: string;
};

type OrderItem = {
  id?: number | string;
  name?: string;
  price?: number;
  quantity?: number;
};

function toValidDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinRange(value: Date | string | null | undefined, range: ReportDateRange) {
  const date = toValidDate(value);
  if (!date) return false;

  if (range.startDate && date.getTime() < range.startDate.getTime()) {
    return false;
  }

  if (range.endDate && date.getTime() >= range.endDate.getTime()) {
    return false;
  }

  return true;
}

function getOrderItems(order: Order) {
  return Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
}

function getSalesOrders(orders: Order[], range: ReportDateRange) {
  return orders.filter((order) => SALES_STATUSES.has(order.status) && isWithinRange(order.createdAt, range));
}

function getPurchasesInRange(purchases: SupplyPurchase[], range: ReportDateRange) {
  return purchases.filter((purchase) => isWithinRange(purchase.purchasedAt, range));
}

function getPurchasesUpToRangeEnd(purchases: SupplyPurchase[], range: ReportDateRange) {
  return purchases.filter((purchase) => {
    const date = toValidDate(purchase.purchasedAt);
    if (!date) return false;
    if (range.endDate && date.getTime() >= range.endDate.getTime()) return false;
    return true;
  });
}

function getMovementsInRange(movements: SupplyStockMovement[], range: ReportDateRange) {
  return movements.filter((movement) => isWithinRange(movement.createdAt, range));
}

function getSupplyStatus(supply: Supply) {
  if (supply.stockQuantity <= 0) return "out";
  if (supply.stockQuantity <= supply.lowStockThreshold) return "low";
  return "healthy";
}

function sortByDateDesc<T>(items: T[], getDate: (item: T) => Date | string | null | undefined) {
  return [...items].sort((left, right) => {
    const leftDate = toValidDate(getDate(left))?.getTime() ?? 0;
    const rightDate = toValidDate(getDate(right))?.getTime() ?? 0;
    return rightDate - leftDate;
  });
}

function getWeightedSupplyCostPerUnit(purchases: SupplyPurchase[]) {
  const costMap = new Map<number, { totalCost: number; totalUnits: number }>();

  for (const purchase of purchases) {
    if (purchase.convertedQuantity <= 0) continue;
    const existing = costMap.get(purchase.supplyId);

    if (existing) {
      existing.totalCost += purchase.totalCost;
      existing.totalUnits += purchase.convertedQuantity;
    } else {
      costMap.set(purchase.supplyId, {
        totalCost: purchase.totalCost,
        totalUnits: purchase.convertedQuantity,
      });
    }
  }

  return new Map(
    Array.from(costMap.entries()).map(([supplyId, value]) => [
      supplyId,
      value.totalUnits > 0 ? value.totalCost / value.totalUnits : 0,
    ]),
  );
}

export async function buildOverviewReport(storage: IStorage, range: ReportDateRange) {
  const [supplies, purchases, orders, menuItems, stockMovements, recipeCoverage] = await Promise.all([
    storage.getAllSupplies(),
    storage.getAllSupplyPurchases(),
    storage.getAllOrders(),
    storage.getAllMenuItems(),
    storage.getSupplyStockMovements(),
    storage.getRecipeCoverageSummaries(),
  ]);

  const filteredPurchases = getPurchasesInRange(purchases, range);
  const filteredSalesOrders = getSalesOrders(orders, range);
  const filteredMovements = getMovementsInRange(stockMovements, range);
  const lowStockSupplies = supplies.filter((supply) => supply.stockQuantity <= supply.lowStockThreshold);

  const supplyById = new Map(supplies.map((supply) => [supply.id, supply]));
  const menuItemById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));

  const topSellingMap = new Map<number, { menuItemId: number; name: string; category: string; quantitySold: number; revenue: number }>();
  for (const order of filteredSalesOrders) {
    for (const item of getOrderItems(order)) {
      const menuItemId = Number(item.id);
      if (!Number.isFinite(menuItemId)) continue;

      const menuItem = menuItemById.get(menuItemId);
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || menuItem?.price || 0;
      const existing = topSellingMap.get(menuItemId);

      if (existing) {
        existing.quantitySold += quantity;
        existing.revenue += quantity * unitPrice;
      } else {
        topSellingMap.set(menuItemId, {
          menuItemId,
          name: item.name || menuItem?.name || `Menu #${menuItemId}`,
          category: menuItem?.category || "-",
          quantitySold: quantity,
          revenue: quantity * unitPrice,
        });
      }
    }
  }

  const topPurchasedMap = new Map<number, {
    supplyId: number;
    name: string;
    unit: string;
    purchaseCount: number;
    totalConvertedQuantity: number;
    totalCost: number;
  }>();

  for (const purchase of filteredPurchases) {
    const supply = supplyById.get(purchase.supplyId);
    const existing = topPurchasedMap.get(purchase.supplyId);

    if (existing) {
      existing.purchaseCount += 1;
      existing.totalConvertedQuantity += purchase.convertedQuantity;
      existing.totalCost += purchase.totalCost;
    } else {
      topPurchasedMap.set(purchase.supplyId, {
        supplyId: purchase.supplyId,
        name: supply?.name || `Barang #${purchase.supplyId}`,
        unit: supply?.unit || "unit",
        purchaseCount: 1,
        totalConvertedQuantity: purchase.convertedQuantity,
        totalCost: purchase.totalCost,
      });
    }
  }

  const recipeCoverageIds = new Set(recipeCoverage.map((item) => item.menuItemId));
  const menuItemsWithoutRecipe = menuItems
    .filter((item) => !recipeCoverageIds.has(item.id))
    .map((item) => ({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
    }));

  const recentActivities = sortByDateDesc(filteredMovements, (movement) => movement.createdAt)
    .slice(0, 8)
    .map((movement) => {
      const supply = supplyById.get(movement.supplyId);
      const changeLabel = movement.quantityChange > 0 ? `+${movement.quantityChange}` : `${movement.quantityChange}`;
      const typeLabel =
        movement.movementType === "purchase"
          ? "Pembelian"
          : movement.movementType === "usage"
            ? "Pemakaian"
            : "Penyesuaian";

      return {
        id: movement.id,
        createdAt: movement.createdAt,
        type: movement.movementType,
        title: `${typeLabel} ${supply?.name || `Barang #${movement.supplyId}`}`,
        description: `${changeLabel} ${movement.unit}${movement.referenceId ? ` · Ref #${movement.referenceId}` : ""}`,
      };
    });

  const totalStockUnits = supplies.reduce((sum, supply) => sum + supply.stockQuantity, 0);
  const totalStockSaleValueEstimate = supplies.reduce(
    (sum, supply) => sum + supply.stockQuantity * (supply.defaultSalePricePerUnit ?? 0),
    0,
  );
  const totalPurchaseCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalSalesRevenue = filteredSalesOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    filters: {
      startDate: range.startDateText ?? null,
      endDate: range.endDateText ?? null,
    },
    kpis: {
      totalSupplies: supplies.length,
      lowStockCount: lowStockSupplies.length,
      totalStockUnits,
      totalStockSaleValueEstimate,
      totalPurchaseCost,
      totalSalesRevenue,
      totalOrders: filteredSalesOrders.length,
      averageOrderValue: filteredSalesOrders.length > 0 ? Math.round(totalSalesRevenue / filteredSalesOrders.length) : 0,
      menuItemsWithoutRecipeCount: menuItemsWithoutRecipe.length,
    },
    lowStockSupplies: lowStockSupplies
      .map((supply) => ({
        supplyId: supply.id,
        name: supply.name,
        currentStock: supply.stockQuantity,
        lowStockThreshold: supply.lowStockThreshold,
        unit: supply.unit,
      }))
      .sort((left, right) => left.currentStock - right.currentStock),
    topSellingItems: Array.from(topSellingMap.values())
      .sort((left, right) => right.quantitySold - left.quantitySold || right.revenue - left.revenue)
      .slice(0, 5),
    topPurchasedSupplies: Array.from(topPurchasedMap.values())
      .sort((left, right) => right.totalCost - left.totalCost)
      .slice(0, 5),
    recipeCoverage: {
      totalMenuItems: menuItems.length,
      menuItemsWithRecipeCount: recipeCoverageIds.size,
      menuItemsWithoutRecipe,
    },
    recentActivities,
  };
}

export async function buildStockReport(storage: IStorage, range: ReportDateRange) {
  const [supplies, stockMovements] = await Promise.all([
    storage.getAllSupplies(),
    storage.getSupplyStockMovements(),
  ]);

  const filteredMovements = sortByDateDesc(getMovementsInRange(stockMovements, range), (movement) => movement.createdAt);
  const supplyById = new Map(supplies.map((supply) => [supply.id, supply]));

  const items = [...supplies]
    .sort((left, right) => {
      const leftStatus = getSupplyStatus(left);
      const rightStatus = getSupplyStatus(right);
      const rank = { out: 0, low: 1, healthy: 2 };
      return rank[leftStatus] - rank[rightStatus] || left.name.localeCompare(right.name, "id-ID");
    })
    .map((supply) => ({
      supplyId: supply.id,
      name: supply.name,
      imageUrl: supply.imageUrl,
      unit: supply.unit,
      supplierName: supply.supplierName,
      currentStock: supply.stockQuantity,
      lowStockThreshold: supply.lowStockThreshold,
      stockStatus: getSupplyStatus(supply),
      defaultPurchaseUnit: supply.defaultPurchaseUnit,
      defaultBaseUnitsPerPurchaseUnit: supply.defaultBaseUnitsPerPurchaseUnit,
      defaultSalePricePerUnit: supply.defaultSalePricePerUnit ?? 0,
      estimatedSaleValue: supply.stockQuantity * (supply.defaultSalePricePerUnit ?? 0),
    }));

  const lowStockCount = items.filter((item) => item.stockStatus === "low").length;
  const outOfStockCount = items.filter((item) => item.stockStatus === "out").length;

  return {
    filters: {
      startDate: range.startDateText ?? null,
      endDate: range.endDateText ?? null,
    },
    summary: {
      totalSupplies: items.length,
      lowStockCount,
      outOfStockCount,
      healthyStockCount: items.length - lowStockCount - outOfStockCount,
      totalStockUnits: items.reduce((sum, item) => sum + item.currentStock, 0),
      totalEstimatedSaleValue: items.reduce((sum, item) => sum + item.estimatedSaleValue, 0),
    },
    items,
    movements: filteredMovements.slice(0, 50).map((movement) => ({
      id: movement.id,
      createdAt: movement.createdAt,
      supplyId: movement.supplyId,
      supplyName: supplyById.get(movement.supplyId)?.name || `Barang #${movement.supplyId}`,
      movementType: movement.movementType,
      quantityChange: movement.quantityChange,
      unit: movement.unit,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
    })),
  };
}

export async function buildPurchasesReport(storage: IStorage, range: ReportDateRange) {
  const [supplies, purchases] = await Promise.all([
    storage.getAllSupplies(),
    storage.getAllSupplyPurchases(),
  ]);

  const supplyById = new Map(supplies.map((supply) => [supply.id, supply]));
  const filteredPurchases = sortByDateDesc(getPurchasesInRange(purchases, range), (purchase) => purchase.purchasedAt);

  const bySupplyMap = new Map<number, {
    supplyId: number;
    name: string;
    unit: string;
    purchaseCount: number;
    totalQuantity: number;
    totalConvertedQuantity: number;
    totalCost: number;
  }>();

  for (const purchase of filteredPurchases) {
    const supply = supplyById.get(purchase.supplyId);
    const existing = bySupplyMap.get(purchase.supplyId);

    if (existing) {
      existing.purchaseCount += 1;
      existing.totalQuantity += purchase.quantity;
      existing.totalConvertedQuantity += purchase.convertedQuantity;
      existing.totalCost += purchase.totalCost;
    } else {
      bySupplyMap.set(purchase.supplyId, {
        supplyId: purchase.supplyId,
        name: supply?.name || `Barang #${purchase.supplyId}`,
        unit: supply?.unit || "unit",
        purchaseCount: 1,
        totalQuantity: purchase.quantity,
        totalConvertedQuantity: purchase.convertedQuantity,
        totalCost: purchase.totalCost,
      });
    }
  }

  const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalConvertedQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.convertedQuantity, 0);

  return {
    filters: {
      startDate: range.startDateText ?? null,
      endDate: range.endDateText ?? null,
    },
    summary: {
      purchaseCount: filteredPurchases.length,
      totalCost,
      totalConvertedQuantity,
      uniqueSupplies: bySupplyMap.size,
      averagePurchaseValue: filteredPurchases.length > 0 ? Math.round(totalCost / filteredPurchases.length) : 0,
    },
    bySupply: Array.from(bySupplyMap.values()).sort((left, right) => right.totalCost - left.totalCost),
    rows: filteredPurchases.map((purchase) => {
      const supply = supplyById.get(purchase.supplyId);
      return {
        id: purchase.id,
        purchasedAt: purchase.purchasedAt,
        supplyId: purchase.supplyId,
        supplyName: supply?.name || `Barang #${purchase.supplyId}`,
        supplierName: purchase.supplierName,
        quantity: purchase.quantity,
        purchaseUnit: purchase.purchaseUnit,
        baseUnitsPerPurchaseUnit: purchase.baseUnitsPerPurchaseUnit,
        convertedQuantity: purchase.convertedQuantity,
        convertedUnit: supply?.unit || "unit",
        unitCost: purchase.unitCost,
        totalCost: purchase.totalCost,
        notes: purchase.notes,
      };
    }),
  };
}

export async function buildSalesReport(storage: IStorage, range: ReportDateRange) {
  const [orders, menuItems] = await Promise.all([
    storage.getAllOrders(),
    storage.getAllMenuItems(),
  ]);

  const menuItemById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
  const filteredOrders = sortByDateDesc(getSalesOrders(orders, range), (order) => order.createdAt);

  const byMenuItemMap = new Map<number, {
    menuItemId: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }>();

  let totalItemsSold = 0;

  for (const order of filteredOrders) {
    for (const item of getOrderItems(order)) {
      const menuItemId = Number(item.id);
      if (!Number.isFinite(menuItemId)) continue;

      const menuItem: MenuItem | undefined = menuItemById.get(menuItemId);
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || menuItem?.price || 0;
      totalItemsSold += quantity;

      const existing = byMenuItemMap.get(menuItemId);
      if (existing) {
        existing.quantitySold += quantity;
        existing.revenue += quantity * unitPrice;
      } else {
        byMenuItemMap.set(menuItemId, {
          menuItemId,
          name: item.name || menuItem?.name || `Menu #${menuItemId}`,
          category: menuItem?.category || "-",
          quantitySold: quantity,
          revenue: quantity * unitPrice,
        });
      }
    }
  }

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    filters: {
      startDate: range.startDateText ?? null,
      endDate: range.endDateText ?? null,
    },
    summary: {
      orderCount: filteredOrders.length,
      totalRevenue,
      totalItemsSold,
      averageOrderValue: filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0,
      confirmedOrderCount: filteredOrders.filter((order) => order.status === "confirmed").length,
      deliveredOrderCount: filteredOrders.filter((order) => order.status === "delivered").length,
    },
    byMenuItem: Array.from(byMenuItemMap.values()).sort(
      (left, right) => right.quantitySold - left.quantitySold || right.revenue - left.revenue,
    ),
    rows: filteredOrders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      serviceType: order.serviceType,
      paymentMethod: order.paymentMethod,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: getOrderItems(order).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
      itemsSummary: getOrderItems(order)
        .map((item) => `${item.name || `Menu #${item.id}`} x${Number(item.quantity) || 0}`)
        .join(", "),
    })),
  };
}

export async function buildProfitEstimateReport(storage: IStorage, range: ReportDateRange) {
  const [orders, menuItems, supplies, purchases] = await Promise.all([
    storage.getAllOrders(),
    storage.getAllMenuItems(),
    storage.getAllSupplies(),
    storage.getAllSupplyPurchases(),
  ]);
  const recipes = await Promise.all(
    menuItems.map(async (menuItem) => ({
      menuItemId: menuItem.id,
      recipes: await storage.getRecipesByMenuItem(menuItem.id),
    })),
  );

  const filteredOrders = sortByDateDesc(getSalesOrders(orders, range), (order) => order.createdAt);
  const menuItemById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
  const supplyById = new Map(supplies.map((supply) => [supply.id, supply]));
  const recipesByMenuItemId = new Map(recipes.map((item) => [item.menuItemId, item.recipes]));
  const costPerUnitBySupplyId = getWeightedSupplyCostPerUnit(getPurchasesUpToRangeEnd(purchases, range));

  const byMenuItemMap = new Map<number, {
    menuItemId: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    estimatedIngredientCost: number;
    estimatedProfit: number;
    marginPercent: number;
    hasRecipe: boolean;
    hasCostBasis: boolean;
  }>();

  const ingredientUsageMap = new Map<number, {
    supplyId: number;
    name: string;
    unit: string;
    estimatedUsedQuantity: number;
    estimatedCost: number;
    averageCostPerUnit: number;
  }>();

  let totalRevenue = 0;
  let estimatedIngredientCost = 0;
  let ordersWithoutRecipe = 0;
  const menuItemsWithoutRecipe = new Set<number>();
  const menuItemCostBasisGaps = new Set<number>();

  const rows = filteredOrders.map((order) => {
    totalRevenue += order.totalAmount;

    let orderEstimatedCost = 0;
    let orderHasMissingRecipe = false;
    let orderHasMissingCostBasis = false;

    for (const item of getOrderItems(order)) {
      const menuItemId = Number(item.id);
      if (!Number.isFinite(menuItemId)) continue;

      const menuItem = menuItemById.get(menuItemId);
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || menuItem?.price || 0;
      const revenue = quantity * unitPrice;
      const recipeItems = recipesByMenuItemId.get(menuItemId) ?? [];

      let itemEstimatedCost = 0;
      let hasCostBasis = true;

      if (recipeItems.length === 0) {
        orderHasMissingRecipe = true;
        menuItemsWithoutRecipe.add(menuItemId);
      } else {
        for (const recipe of recipeItems) {
          const supply = supplyById.get(recipe.supplyId);
          const usedQuantity = recipe.quantityRequired * quantity;
          const averageCostPerUnit = costPerUnitBySupplyId.get(recipe.supplyId);

          if (averageCostPerUnit === undefined) {
            hasCostBasis = false;
            orderHasMissingCostBasis = true;
            menuItemCostBasisGaps.add(menuItemId);
          } else {
            const usageCost = usedQuantity * averageCostPerUnit;
            itemEstimatedCost += usageCost;

            const ingredientUsage = ingredientUsageMap.get(recipe.supplyId);
            if (ingredientUsage) {
              ingredientUsage.estimatedUsedQuantity += usedQuantity;
              ingredientUsage.estimatedCost += usageCost;
            } else {
              ingredientUsageMap.set(recipe.supplyId, {
                supplyId: recipe.supplyId,
                name: supply?.name || `Barang #${recipe.supplyId}`,
                unit: supply?.unit || "unit",
                estimatedUsedQuantity: usedQuantity,
                estimatedCost: usageCost,
                averageCostPerUnit,
              });
            }
          }
        }
      }

      orderEstimatedCost += itemEstimatedCost;

      const estimatedProfit = revenue - itemEstimatedCost;
      const marginPercent = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
      const existing = byMenuItemMap.get(menuItemId);

      if (existing) {
        existing.quantitySold += quantity;
        existing.revenue += revenue;
        existing.estimatedIngredientCost += itemEstimatedCost;
        existing.estimatedProfit += estimatedProfit;
        existing.marginPercent = existing.revenue > 0 ? (existing.estimatedProfit / existing.revenue) * 100 : 0;
        existing.hasRecipe = existing.hasRecipe && recipeItems.length > 0;
        existing.hasCostBasis = existing.hasCostBasis && hasCostBasis;
      } else {
        byMenuItemMap.set(menuItemId, {
          menuItemId,
          name: item.name || menuItem?.name || `Menu #${menuItemId}`,
          category: menuItem?.category || "-",
          quantitySold: quantity,
          revenue,
          estimatedIngredientCost: itemEstimatedCost,
          estimatedProfit,
          marginPercent,
          hasRecipe: recipeItems.length > 0,
          hasCostBasis,
        });
      }
    }

    estimatedIngredientCost += orderEstimatedCost;
    if (orderHasMissingRecipe) ordersWithoutRecipe += 1;

    return {
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      status: order.status,
      totalAmount: order.totalAmount,
      estimatedIngredientCost: Math.round(orderEstimatedCost),
      estimatedProfit: Math.round(order.totalAmount - orderEstimatedCost),
      marginPercent: order.totalAmount > 0 ? ((order.totalAmount - orderEstimatedCost) / order.totalAmount) * 100 : 0,
      hasMissingRecipe: orderHasMissingRecipe,
      hasMissingCostBasis: orderHasMissingCostBasis,
    };
  });

  const grossProfit = totalRevenue - estimatedIngredientCost;

  return {
    filters: {
      startDate: range.startDateText ?? null,
      endDate: range.endDateText ?? null,
    },
    summary: {
      orderCount: filteredOrders.length,
      totalRevenue,
      estimatedIngredientCost: Math.round(estimatedIngredientCost),
      grossProfit: Math.round(grossProfit),
      grossMarginPercent: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      ordersWithoutRecipe,
      menuItemsWithoutRecipeCount: menuItemsWithoutRecipe.size,
      itemsWithoutCostBasisCount: menuItemCostBasisGaps.size,
    },
    byMenuItem: Array.from(byMenuItemMap.values())
      .sort((left, right) => right.estimatedProfit - left.estimatedProfit || right.revenue - left.revenue)
      .map((item) => ({
        ...item,
        estimatedIngredientCost: Math.round(item.estimatedIngredientCost),
        estimatedProfit: Math.round(item.estimatedProfit),
        marginPercent: Number(item.marginPercent.toFixed(2)),
      })),
    topIngredientCosts: Array.from(ingredientUsageMap.values())
      .sort((left, right) => right.estimatedCost - left.estimatedCost)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        estimatedCost: Math.round(item.estimatedCost),
        averageCostPerUnit: Math.round(item.averageCostPerUnit),
      })),
    rows: rows.map((row) => ({
      ...row,
      marginPercent: Number(row.marginPercent.toFixed(2)),
    })),
  };
}
