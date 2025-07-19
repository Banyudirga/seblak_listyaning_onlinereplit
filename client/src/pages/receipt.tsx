import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Printer, MessageCircle, ArrowLeft } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { Order } from "@shared/schema";

export default function Receipt() {
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Get order data from sessionStorage
    const orderData = sessionStorage.getItem('currentOrder');
    if (orderData) {
      setOrder(JSON.parse(orderData));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!order) return;
    
    const items = Array.isArray(order.items) ? order.items : [];
    const itemList = items.map((item: any) => 
      `${item.name} (${item.quantity}x) - ${formatRupiah(item.price * item.quantity)}`
    ).join('\n');
    
    const message = `*PESANAN SEBLAK LISTYANING*
    
Nomor Pesanan: #${order.id}
Tanggal: ${new Date(order.createdAt!).toLocaleDateString('id-ID')}

*Detail Pesanan:*
${itemList}

*Total: ${formatRupiah(order.totalAmount)}*

*Data Pelanggan:*
Nama: ${order.customerName}
Telepon: ${order.customerPhone}
Alamat: ${order.customerAddress}
Cara Pelayanan: ${order.serviceType}
${order.notes ? `Catatan: ${order.notes}` : ''}

Terima kasih telah memesan di Seblak Listyaning! 🌶️`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBackHome = () => {
    sessionStorage.removeItem('currentOrder');
    setLocation('/');
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-light-grey py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-fresh-green text-white">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">Pesanan Berhasil!</CardTitle>
            <p className="text-green-100">Terima kasih telah memesan di Seblak Listyaning</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Order Info */}
            <div className="text-center">
              <p className="text-gray-600">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-indonesian-red">#{order.id}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt!).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-3">Informasi Pelanggan</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telepon:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alamat:</span>
                  <span className="font-medium text-right max-w-xs">{order.customerAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cara Pelayanan:</span>
                  <span className="font-medium capitalize">{order.serviceType}</span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catatan:</span>
                    <span className="font-medium text-right max-w-xs">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-3">Detail Pesanan</h3>
              <div className="space-y-3">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">({item.quantity}x)</span>
                    </div>
                    <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total Pembayaran:</span>
                  <span className="text-2xl font-bold text-indonesian-red">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">Status: Sedang Diproses</p>
              <p className="text-yellow-600 text-sm mt-1">
                Pesanan Anda sedang diproses. Kami akan menghubungi Anda segera.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Struk
              </Button>
              <Button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Bagikan ke WhatsApp
              </Button>
            </div>

            <Button
              onClick={handleBackHome}
              variant="ghost"
              className="w-full mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}