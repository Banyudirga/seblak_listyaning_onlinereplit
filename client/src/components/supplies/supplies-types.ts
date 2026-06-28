export type RecipeCoverageSummary = {
  menuItemId: number;
  ingredientCount: number;
};

export type SupplyForm = {
  name: string;
  imageUrl: string;
  unit: string;
  stockQuantity: string;
  lowStockThreshold: string;
  supplierName: string;
};

export type PurchaseForm = {
  supplyId: string;
  quantity: string;
  purchaseUnit: string;
  baseUnitsPerPurchaseUnit: string;
  unitCost: string;
  supplierName: string;
  notes: string;
};

export type RecipeDraft = {
  supplyId: string;
  quantityRequired: string;
};

export const PURCHASE_UNIT_OPTIONS = ["pcs", "gram", "kg", "ml", "liter", "pack", "box"];

export function getSuggestedConversion(purchaseUnit: string, baseUnit: string) {
  if (purchaseUnit === baseUnit) return 1;
  if (purchaseUnit === "kg" && baseUnit === "gram") return 1000;
  if (purchaseUnit === "liter" && baseUnit === "ml") return 1000;
  return null;
}