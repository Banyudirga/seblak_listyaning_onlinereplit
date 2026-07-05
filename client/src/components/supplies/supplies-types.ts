export type RecipeCoverageSummary = {
  menuItemId: number;
  ingredientCount: number;
};

export type SupplyForm = {
  name: string;
  imageUrl: string;
  imageFile: File | null;
  unit: string;
  defaultPurchaseUnit: string;
  defaultBaseUnitsPerPurchaseUnit: string;
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

export const COMMON_UNIT_SUGGESTIONS = ["pcs", "gram", "kg", "ml", "liter", "pack", "box", "bungkus", "botol", "sachet", "tray", "kaleng"];

export function getSuggestedConversion(purchaseUnit: string, baseUnit: string) {
  if (purchaseUnit === baseUnit) return 1;
  if (purchaseUnit === "kg" && baseUnit === "gram") return 1000;
  if (purchaseUnit === "liter" && baseUnit === "ml") return 1000;
  return null;
}