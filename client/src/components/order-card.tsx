import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Phone, MapPin, CreditCard } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getStatusColor, getStatusText, getPaymentMethodText } from "@/lib/admin-helpers";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (status: string) => void;
  isUpdating: boolean;
}

export default function OrderCard({ order, onUpdateStatus, isUpdating }: OrderCardProps) {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Card className="shadow-sm">
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
                  onClick={() => onUpdateStatus(status)}
                  disabled={isUpdating}
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
}
