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
  customerAddress: z.string().min(10, "Alamat lengkap wajib diisi"),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
});

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
    onSuccess: () => {
      toast({
        title: "Pesanan Berhasil!",
        description: "Terima kasih! Pesanan Anda sedang diproses.",
      });
      clearCart();
      setIsOpen(false);
      form.reset();
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
              Informasi Pengiriman
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
                    <FormLabel>Nama Lengkap</FormLabel>
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
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap</FormLabel>
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
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cara Pelayanan (Opsional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
