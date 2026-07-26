export type ReportsFilters = {
  startDate: string;
  endDate: string;
};

export type OverviewReport = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  kpis: {
    totalSupplies: number;
    lowStockCount: number;
    totalStockUnits: number;
    totalStockSaleValueEstimate: number;
    totalPurchaseCost: number;
    totalSalesRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    menuItemsWithoutRecipeCount: number;
  };
  lowStockSupplies: Array<{
    supplyId: number;
    name: string;
    currentStock: number;
    lowStockThreshold: number;
    unit: string;
  }>;
  topSellingItems: Array<{
    menuItemId: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }>;
  topPurchasedSupplies: Array<{
    supplyId: number;
    name: string;
    unit: string;
    purchaseCount: number;
    totalConvertedQuantity: number;
    totalCost: number;
  }>;
  recipeCoverage: {
    totalMenuItems: number;
    menuItemsWithRecipeCount: number;
    menuItemsWithoutRecipe: Array<{
      menuItemId: number;
      name: string;
      category: string;
    }>;
  };
  recentActivities: Array<{
    id: number;
    createdAt: string;
    type: string;
    title: string;
    description: string;
  }>;
};

export type StockReport = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    totalSupplies: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStockCount: number;
    totalStockUnits: number;
    totalEstimatedSaleValue: number;
  };
  items: Array<{
    supplyId: number;
    name: string;
    imageUrl: string | null;
    unit: string;
    supplierName: string | null;
    currentStock: number;
    lowStockThreshold: number;
    stockStatus: "out" | "low" | "healthy";
    defaultPurchaseUnit: string;
    defaultBaseUnitsPerPurchaseUnit: number;
    defaultSalePricePerUnit: number;
    estimatedSaleValue: number;
  }>;
  movements: Array<{
    id: number;
    createdAt: string;
    supplyId: number;
    supplyName: string;
    movementType: string;
    quantityChange: number;
    unit: string;
    referenceType: string;
    referenceId: number | null;
    notes: string | null;
  }>;
};

export type PurchasesReport = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    purchaseCount: number;
    totalCost: number;
    totalConvertedQuantity: number;
    uniqueSupplies: number;
    averagePurchaseValue: number;
  };
  bySupply: Array<{
    supplyId: number;
    name: string;
    unit: string;
    purchaseCount: number;
    totalQuantity: number;
    totalConvertedQuantity: number;
    totalCost: number;
  }>;
  rows: Array<{
    id: number;
    purchasedAt: string;
    supplyId: number;
    supplyName: string;
    supplierName: string | null;
    quantity: number;
    purchaseUnit: string;
    baseUnitsPerPurchaseUnit: number;
    convertedQuantity: number;
    convertedUnit: string;
    unitCost: number;
    totalCost: number;
    notes: string | null;
  }>;
};

export type SalesReport = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    orderCount: number;
    totalRevenue: number;
    totalItemsSold: number;
    averageOrderValue: number;
    confirmedOrderCount: number;
    deliveredOrderCount: number;
  };
  byMenuItem: Array<{
    menuItemId: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }>;
  rows: Array<{
    id: number;
    createdAt: string;
    customerName: string;
    serviceType: string;
    paymentMethod: string;
    status: string;
    totalAmount: number;
    itemCount: number;
    itemsSummary: string;
  }>;
};

export type ProfitEstimateReport = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    orderCount: number;
    totalRevenue: number;
    estimatedIngredientCost: number;
    grossProfit: number;
    grossMarginPercent: number;
    ordersWithoutRecipe: number;
    menuItemsWithoutRecipeCount: number;
    itemsWithoutCostBasisCount: number;
  };
  byMenuItem: Array<{
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
  }>;
  topIngredientCosts: Array<{
    supplyId: number;
    name: string;
    unit: string;
    estimatedUsedQuantity: number;
    estimatedCost: number;
    averageCostPerUnit: number;
  }>;
  rows: Array<{
    id: number;
    createdAt: string;
    customerName: string;
    status: string;
    totalAmount: number;
    estimatedIngredientCost: number;
    estimatedProfit: number;
    marginPercent: number;
    hasMissingRecipe: boolean;
    hasMissingCostBasis: boolean;
  }>;
};
