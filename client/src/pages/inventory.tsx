import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertTriangle, Package, Plus, Minus, Edit, ArrowLeft, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MenuItem } from "@shared/schema";
import { Link } from "wouter";

const updateStockSchema = z.object({
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().min(1, "Threshold must be at least 1"),
});

type UpdateStockForm = z.infer<typeof updateStockSchema>;

export default function Inventory() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { data: menuItems = [], isLoading, refetch } = useQuery({
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

  const form = useForm<UpdateStockForm>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      stockQuantity: 0,
      lowStockThreshold: 10,
    },
  });

  const filteredItems = menuItems.filter((item: MenuItem) => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const getStockStatus = (item: MenuItem) => {
    if (!item.isAvailable) return { status: 'unavailable', color: 'bg-gray-100 text-gray-800' };
    if (item.stockQuantity === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
    if (item.stockQuantity <= item.lowStockThreshold) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'unavailable': return 'Tidak Tersedia';
      case 'out-of-stock': return 'Habis';
      case 'low-stock': return 'Stok Menipis';
      case 'in-stock': return 'Tersedia';
      default: return status;
    }
  };

  const inventoryStats = {
    total: menuItems.length,
    available: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity > 0).length,
    lowStock: menuItems.filter((item: MenuItem) => item.isAvailable && item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0).length,
    outOfStock: menuItems.filter((item: MenuItem) => item.stockQuantity === 0).length,
  };

  const handleEditStock = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
    });
  };

  const onSubmit = (data: UpdateStockForm) => {
    if (editingItem) {
      updateStockMutation.mutate({ itemId: editingItem.id, data });
    }
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
          {filteredItems.map((item: MenuItem) => {
            const stockStatus = getStockStatus(item);
            return (
              <Card key={item.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                      <p className="text-lg font-bold text-indonesian-red mt-1">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <Badge className={stockStatus.color}>
                      {getStockStatusText(stockStatus.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className="font-bold">{item.stockQuantity} {item.unit}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low Stock Alert:</span>
                      <span className="text-sm">{item.lowStockThreshold} {item.unit}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditStock(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Stock
                      </Button>
                      
                      <Button
                        variant={item.isAvailable ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAvailabilityMutation.mutate({ 
                          itemId: item.id, 
                          isAvailable: item.isAvailable ? 0 : 1 
                        })}
                        disabled={toggleAvailabilityMutation.isPending}
                      >
                        {item.isAvailable ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {editingItem?.name}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock ({editingItem?.unit})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Alert Threshold ({editingItem?.unit})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateStockMutation.isPending}
                  className="flex-1"
                >
                  Update Stock
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}