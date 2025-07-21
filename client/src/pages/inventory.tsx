import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, ArrowLeft, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@shared/schema";
import { Link } from "wouter";
import InventoryCard from "@/components/inventory-card";
import EditStockDialog, { type UpdateStockForm } from "@/components/edit-stock-dialog";

export default function Inventory() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { data: menuItems = [], isLoading, refetch } = useQuery<MenuItem[]>({
    queryKey: ['/api/admin/inventory'],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: UpdateStockForm }) => {
      return apiRequest(`/api/admin/inventory/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Stock Updated",
        description: "Item stock has been updated successfully.",
      });
      setEditingItem(null);
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }: { itemId: number; isAvailable: number }) => {
      return apiRequest(`/api/admin/inventory/${itemId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Availability Updated",
        description: "Item availability has been updated.",
      });
    },
  });

  const filteredItems = menuItems.filter((item: MenuItem) => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const inventoryStats = {
    total: menuItems.length,
    available: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity > 0).length,
    lowStock: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0).length,
    outOfStock: menuItems.filter((item: MenuItem) => item.stockQuantity === 0).length,
  };

  const handleUpdateStock = (data: UpdateStockForm) => {
    if (editingItem) {
      updateStockMutation.mutate({ itemId: editingItem.id, data });
    }
  };

  const handleToggleAvailability = (item: MenuItem) => {
    toggleAvailabilityMutation.mutate({ 
      itemId: item.id, 
      isAvailable: item.isAvailable ? 0 : 1 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey">
      {/* Header */}
      <div className="bg-indonesian-red text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" className="text-indonesian-red border-white hover:bg-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <p className="text-red-100">Kelola Stok Menu</p>
              </div>
            </div>
            <Button 
              onClick={() => refetch()}
              variant="outline" 
              className="text-indonesian-red border-white hover:bg-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indonesian-red">{inventoryStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inventoryStats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="seblak">Seblak</SelectItem>
              <SelectItem value="makanan">Makanan</SelectItem>
              <SelectItem value="minuman">Minuman</SelectItem>
            </SelectContent>
          </Select>
          
          {inventoryStats.lowStock > 0 && (
            <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{inventoryStats.lowStock} items need restocking</span>
            </div>
          )}
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: MenuItem) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEditStock={setEditingItem}
              onToggleAvailability={handleToggleAvailability}
              isTogglingAvailability={toggleAvailabilityMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Edit Stock Dialog */}
      <EditStockDialog
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleUpdateStock}
        isUpdating={updateStockMutation.isPending}
      />
    </div>
  );
}