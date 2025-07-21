import type { MenuItem } from "@shared/schema";

export const getStockStatus = (item: MenuItem) => {
  if (!item.isAvailable) return { status: 'unavailable', color: 'bg-gray-100 text-gray-800' };
  if (item.stockQuantity === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
  if (item.stockQuantity <= item.lowStockThreshold) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
  return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
};

export const getStockStatusText = (status: string) => {
  switch (status) {
    case 'unavailable': return 'Tidak Tersedia';
    case 'out-of-stock': return 'Habis';
    case 'low-stock': return 'Stok Menipis';
    case 'in-stock': return 'Tersedia';
    default: return status;
  }
};
