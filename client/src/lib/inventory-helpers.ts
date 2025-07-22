import type { MenuItem } from "@shared/schema";
import { getStockStatus as getItemStockStatus } from "@shared/inventory-utils";

// Re-export the shared utility function with the same interface
export const getStockStatus = getItemStockStatus;

export const getStockStatusText = (status: string) => {
  switch (status) {
    case 'unavailable': return 'Tidak Tersedia';
    case 'out-of-stock': return 'Habis';
    case 'low-stock': return 'Stok Menipis';
    case 'in-stock': return 'Tersedia';
    default: return status;
  }
};
