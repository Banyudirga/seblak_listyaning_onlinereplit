import type { MenuItem } from './schema';

/**
 * Utility functions for inventory management
 */

/**
 * Determines the stock status of a menu item
 * @param item The menu item to check
 * @returns An object containing status and color information
 */
export function getStockStatus(item: MenuItem) {
  if (!item.isAvailable) return { status: 'unavailable', color: 'bg-gray-100 text-gray-800' };
  if (item.stockQuantity <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
  if (item.stockQuantity <= item.lowStockThreshold) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
  return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
}

/**
 * Calculates inventory statistics for a collection of menu items
 * @param menuItems Array of menu items
 * @returns Object containing total, available, lowStock, and outOfStock counts
 */
export function calculateInventoryStats(menuItems: MenuItem[]) {
  return {
    total: menuItems.length,
    available: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity > 0).length,
    lowStock: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0).length,
    outOfStock: menuItems.filter((item: MenuItem) => !item.isAvailable || item.stockQuantity <= 0).length,
  };
}