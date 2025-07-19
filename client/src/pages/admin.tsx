import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, Phone, MapPin, CreditCard, FileText, RefreshCw } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: orders = [], isLoading, refetch } = useQuery({
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'preparing': return 'Sedang Dimasak';
      case 'ready': return 'Siap';
      case 'delivered': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'bank_transfer': return 'Transfer Bank';
      case 'gopay': return 'GoPay';
      case 'ovo': return 'OVO';
      case 'dana': return 'DANA';
      default: return method?.toUpperCase();
    }
  };

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
            </div>
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
            filteredOrders.map((order: Order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <Card key={order.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pesanan #{order.id}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt!).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold text-lg text-indonesian-red">
                            {formatRupiah(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium mb-3">Informasi Pelanggan</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium w-20">Nama:</span>
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="font-medium w-16">Phone:</span>
                            <a 
                              href={`tel:${order.customerPhone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.customerPhone}
                            </a>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                            <span className="font-medium w-16">Alamat:</span>
                            <span className="flex-1">{order.customerAddress}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">Layanan:</span>
                            <span className="capitalize">{order.serviceType}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            <span className="font-medium w-16">Payment:</span>
                            <span>{getPaymentMethodText(order.paymentMethod)}</span>
                          </div>
                          {order.notes && (
                            <div className="flex items-start">
                              <span className="font-medium w-20">Catatan:</span>
                              <span className="flex-1 italic">{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-3">Detail Pesanan</h4>
                        <div className="space-y-2">
                          {items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} ({item.quantity}x)</span>
                              <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span className="text-indonesian-red">{formatRupiah(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Update Status:</span>
                        <div className="flex gap-2">
                          {['confirmed', 'preparing', 'ready', 'delivered'].map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={order.status === status ? "default" : "outline"}
                              onClick={() => updateOrderMutation.mutate({ 
                                orderId: order.id, 
                                status 
                              })}
                              disabled={updateOrderMutation.isPending}
                            >
                              {getStatusText(status)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}