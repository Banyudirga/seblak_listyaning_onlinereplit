import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, RefreshCw, Package, ArrowLeft, Warehouse, LogOut, BarChart3 } from "lucide-react";
import { apiRequest, getApiUrl, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import type { Order } from "@shared/schema";
import OrderCard from "@/components/order-card";

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
  
  // Setup audio notification for new orders
  useEffect(() => {
    // Load notification script
    const script = document.createElement('script');
    script.src = '/notification.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Event listener for new order notifications
    const handleNewOrderNotification = () => {
      // Play notification sound using the Web Audio API
      if (window.generateNotificationSound) {
        window.generateNotificationSound();
      }
      
      toast({
        title: "Pesanan baru masuk!",
        description: "Ada pesanan baru yang perlu diproses.",
        variant: "default",
      });
      
      // Refresh orders list
      refetch();
    };
    
    // Add event listener
    window.addEventListener('newOrderNotification', handleNewOrderNotification);
    
    // Cleanup
    return () => {
      window.removeEventListener('newOrderNotification', handleNewOrderNotification);
      document.body.removeChild(script);
    };
  }, [toast, refetch]);

  const updateOrderMutation = useMutation({
  mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
    return apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, { status });
  },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Status diperbarui",
        description: "Status pesanan berhasil diperbarui.",
      });
    },
    onError: (error) => {
    console.error("Mutation error:", error);
    toast({
      title: "Terjadi kesalahan",
      description: `Gagal memperbarui status: ${error.message}`,
      variant: "destructive",
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

  const handleLogout = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(text);
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
      setLocation('/admin/login');
      toast({
        title: 'Berhasil keluar',
        description: 'Sesi admin telah diakhiri.',
      });
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: error instanceof Error ? error.message : 'Gagal keluar dari sesi admin.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey">
      {/* Header */}
      <div className="bg-indonesian-red text-white">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-b-[28px] bg-indonesian-red px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <Link href="/" className="inline-block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-4 h-9 border-white/80 bg-white text-indonesian-red hover:bg-white/90"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                  </Button>
                </Link>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-100">
                    Panel Admin
                  </p>
                  <h1 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                    Seblak Listyaning
                  </h1>
                  <p className="max-w-md text-sm leading-6 text-red-100 sm:text-base">
                    Kelola pesanan, stok, dan barang dari satu dashboard yang lebih nyaman di mobile.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:max-w-[680px]">
                <Link href="/inventory">
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Inventaris
                  </Button>
                </Link>
                <Link href="/supplies">
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
                  >
                    <Warehouse className="mr-2 h-4 w-4" />
                    Barang
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Laporan
                  </Button>
                </Link>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Muat ulang
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>
              </div>
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
              <SelectValue placeholder="Filter status" />
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
