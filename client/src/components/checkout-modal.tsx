import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Send } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Nama lengkap wajib diisi"),
  customerPhone: z.string().min(10, "Nomor telepon tidak valid"),
  serviceType: z.string().min(1, "Cara pelayanan wajib dipilih"),
  customerAddress: z.string().refine(
    (val) => {
      // If service type is "diantar", address is required
      if (val === "" && window.serviceTypeValue === "diantar") {
        return false;
      }
      // For other service types, any address is valid
      return true;
    },
    {
      message: "Alamat lengkap wajib diisi untuk pengantaran",
    }
  ),
  paymentMethod: z.string().min(1, "Metode pembayaran wajib dipilih"),
  notes: z.string().optional(),
});

// Declare global window property for service type value
declare global {
  interface Window {
    serviceTypeValue: string;
  }
}

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const totalPrice = getTotalPrice();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      serviceType: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CheckoutForm) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...orderData,
        items: items.map(item => ({
          id: parseInt(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Store order data in sessionStorage
      sessionStorage.setItem('currentOrder', JSON.stringify(data));
      
      toast({
        title: "Pesanan Berhasil!",
        description: "Terima kasih! Pesanan Anda sedang diproses.",
      });
      clearCart();
      setIsOpen(false);
      form.reset();
      
      // Navigate to receipt page
      window.location.href = '/receipt';
    },
    onError: () => {
      toast({
        title: "Gagal Membuat Pesanan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    // Play notification sound for admin
    const notificationEvent = new CustomEvent('newOrderNotification', { detail: data });
    window.dispatchEvent(notificationEvent);
    
    createOrderMutation.mutate(data);
  };

  // Open modal when called from parent
  useEffect(() => {
    const handleOpenCheckout = () => setIsOpen(true);
    window.addEventListener('openCheckout', handleOpenCheckout);
    return () => window.removeEventListener('openCheckout', handleOpenCheckout);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-full overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-dark-grey">
              INFORMASI PEMESANAN
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap (Wajib)</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon (Wajib)</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cara Pelayanan (Wajib)</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Store service type value in window object for validation
                        window.serviceTypeValue = value;
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih cara pelayanan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diantar">Diantar</SelectItem>
                        <SelectItem value="diambil">Diambil</SelectItem>
                        <SelectItem value="makan ditempat">Makan ditempat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alamat Lengkap {form.watch("serviceType") === "diantar" && "(Wajib)"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Jl. Nama Jalan No. 123, Kelurahan, Kecamatan"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Tunai (Cash)</SelectItem>
                        <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                        <SelectItem value="gopay">GoPay</SelectItem>
                        <SelectItem value="ovo">OVO</SelectItem>
                        <SelectItem value="dana">DANA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tingkat kepedasan, permintaan khusus, dll."
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-dark-grey mb-2">
                    Ringkasan Pesanan
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} ({item.quantity}x)</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Pembayaran:</span>
                      <span className="text-xl font-bold text-indonesian-red">
                        {formatRupiah(totalPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-indonesian-red text-white hover:bg-red-600"
                disabled={createOrderMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {createOrderMutation.isPending ? "Memproses..." : "Pesan Sekarang"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
