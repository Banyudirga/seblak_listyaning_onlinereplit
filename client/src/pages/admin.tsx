import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, RefreshCw, Package, ArrowLeft, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Order } from "@shared/schema";
import OrderCard from "@/components/order-card";

export default function Admin() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    },
  });

  const filteredOrders = orders.filter((order: Order) => 
    selectedStatus === "all" || order.status === selectedStatus
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o: Order) => o.status === 'pending').length,
    preparing: orders.filter((o: Order) => o.status === 'preparing').length,
    ready: orders.filter((o: Order) => o.status === 'ready').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading orders...</p>
        </div>
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
              <h1 className="text-2xl font-bold">Seblak Listyaning - Admin</h1>
              <p className="text-red-100">Dashboard Pemilik Restoran</p>
              <Link href="/" className="inline-block mt-1">
                <Button variant="outline" size="sm" className="text-indonesian-red border-white hover:bg-white text-xs py-1 h-auto">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Kembali
                </Button>
              </Link>
            </div>
            <div className="flex gap-3">
              <Link href="/inventory">
                <Button 
                  variant="outline" 
                  className="text-indonesian-red border-white hover:bg-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </Link>
              <Button 
                onClick={() => refetch()}
                variant="outline" 
                className="text-indonesian-red border-white hover:bg-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
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
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indonesian-red">{orderStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sedang Dimasak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{orderStats.preparing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Siap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{orderStats.ready}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pesanan</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
              <SelectItem value="preparing">Sedang Dimasak</SelectItem>
              <SelectItem value="ready">Siap</SelectItem>
              <SelectItem value="delivered">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order: Order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={(status) => updateOrderMutation.mutate({ orderId: order.id, status })}
                isUpdating={updateOrderMutation.isPending}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}