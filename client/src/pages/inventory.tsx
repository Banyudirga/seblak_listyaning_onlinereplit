import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, ArrowLeft, AlertCircle, PlusCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import { calculateInventoryStats } from "@shared/inventory-utils";
import { Link } from "wouter";
import InventoryCard from "@/components/inventory-card";
import EditStockDialog, { type UpdateStockForm } from "@/components/edit-stock-dialog";
import AddMenuDialog, { type AddMenuForm } from "@/components/add-menu-dialog";

export default function Inventory() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);

  const { data: menuItems = [], isLoading, refetch } = useQuery<MenuItem[]>({
    queryKey: ['/api/admin/inventory'],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: UpdateStockForm }) => {
      return apiRequest(
        'PATCH',
        `/api/admin/inventory/${itemId}`,
        data
      );
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

  const addMenuMutation = useMutation({
    mutationFn: async (data: AddMenuForm) => {
      // Handle file upload if image is a File object
      let imageUrl = data.image;
      
      if (data.image instanceof File) {
        // For now, we'll create a base64 string from the file
        // In a production app, you would upload to Supabase Storage
        const reader = new FileReader();
        imageUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(data.image as File);
        });
        
        console.log("File converted to base64 for storage");
      }
      
      // Create the menu item data with the processed image
      const menuItemData: InsertMenuItem = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: imageUrl as string,
        spicyLevel: data.spicyLevel,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        unit: data.unit,
        isAvailable: data.isAvailable,
      };
      
      // Send the data to the API endpoint
      const response = await apiRequest(
        'POST',
        '/api/admin/inventory',
        menuItemData
      );
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Menu Item Added",
        description: "New menu item has been added successfully.",
      });
      setIsAddMenuOpen(false);
    },
    onError: (error) => {
      console.error("Error adding menu item:", error);
      toast({
        title: "Error",
        description: "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }: { itemId: number; isAvailable: number }) => {
      return apiRequest(
        'PATCH',
        `/api/admin/inventory/${itemId}/availability`,
        { isAvailable }
      );
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

  const inventoryStats = calculateInventoryStats(menuItems);

  const handleUpdateStock = (data: UpdateStockForm) => {
    if (editingItem) {
      updateStockMutation.mutate({ itemId: editingItem.id, data });
    }
  };

  const handleAddMenu = (data: AddMenuForm) => {
    addMenuMutation.mutate(data);
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
            <div>
              <h1 className="text-2xl font-bold">Inventory Management</h1>
              <p className="text-red-100">Kelola Stok Menu</p>
              <Link href="/admin" className="inline-block mt-1">
                <Button variant="outline" size="sm" className="text-indonesian-red border-white hover:bg-white text-xs py-1 h-auto">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Kembali ke Admin
                </Button>
              </Link>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAddMenuOpen(true)}
                variant="outline" 
                className="text-indonesian-red border-white hover:bg-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Menu
              </Button>
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
              {/* Predefined categories */}
              <SelectItem value="seblak">Seblak</SelectItem>
              <SelectItem value="prasmanan">Seblak Prasmanan</SelectItem>
              <SelectItem value="makanan">Makanan</SelectItem>
              <SelectItem value="minuman">Minuman</SelectItem>
              <SelectItem value="cemilan">Cemilan</SelectItem>
              {/* Add any unique categories from existing menu items that aren't in the predefined list */}
              {Array.from(new Set(menuItems.map(item => item.category)))
                .filter(cat => !['seblak', 'prasmanan', 'makanan', 'minuman', 'cemilan', 'all'].includes(cat))
                .map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
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

      {/* Add Menu Dialog */}
      <AddMenuDialog
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onSubmit={handleAddMenu}
        isSubmitting={addMenuMutation.isPending}
      />
    </div>
  );
}