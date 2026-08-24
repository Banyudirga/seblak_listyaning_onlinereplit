import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MenuItem } from "@shared/schema";
import { useEffect, useState } from "react";

const updateStockSchema = z.object({
  stockQuantity: z.number().min(0, "Stok tidak boleh negatif"),
  lowStockThreshold: z.number().min(1, "Batas minimum harus minimal 1"),
  image: z.instanceof(File).or(z.string().min(1, "Gambar wajib diisi")).optional().or(z.literal("")),
});

export type UpdateStockForm = z.infer<typeof updateStockSchema>;

interface EditStockDialogProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateStockForm) => void;
  isUpdating: boolean;
}

export default function EditStockDialog({ item, isOpen, onClose, onSubmit, isUpdating }: EditStockDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<UpdateStockForm>({
    resolver: zodResolver(updateStockSchema),
  });

  const imageValue = form.watch("image");
  const selectedFileName = imageValue instanceof File ? imageValue.name : (typeof imageValue === "string" && imageValue ? "URL gambar diisi" : "Gunakan gambar lama");

  useEffect(() => {
    if (item) {
      form.reset({
        stockQuantity: item.stockQuantity ?? 0,
        lowStockThreshold: item.lowStockThreshold ?? 1,
        image: "",
      });
      setImagePreview(item.image || null);
    }
  }, [item, form]);

  useEffect(() => {
    if (imageValue instanceof File) {
      const objectUrl = URL.createObjectURL(imageValue);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof imageValue === "string" && imageValue.trim()) {
      setImagePreview(imageValue.trim());
      return;
    }

    if (item && !(typeof imageValue === "string" && imageValue)) {
      setImagePreview(item.image || null);
    }
  }, [imageValue, item]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-lg translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:max-h-[90vh] sm:w-full sm:translate-y-[-50%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>Edit Menu - {item.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">

            {/* Gambar Menu */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Gambar Menu</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="mb-2 text-xs text-muted-foreground">
                            {item && !value ? "Gambar saat ini" : "Preview gambar"}
                          </p>
                          <img 
                            src={imagePreview} 
                            alt={item?.name || "Preview menu"} 
                            className="h-40 w-full rounded-md bg-muted object-cover" 
                          />
                        </div>
                      )}
                      {!imagePreview && (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                          Belum ada gambar. Silakan upload gambar atau isi URL di bawah.
                        </div>
                      )}
                      <Input
                        id="edit-menu-image-file"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...fieldProps}
                      />
                      <div className="flex items-stretch">
                        <label
                          htmlFor="edit-menu-image-file"
                          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {value instanceof File ? "Ganti file" : "Pilih file"}
                        </label>
                        <Input
                          id="edit-menu-image-url"
                          className="rounded-l-none"
                          placeholder="Atau isi URL gambar (https://...)"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => onChange(e.target.value)}
                        />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{selectedFileName}</p>
                      {imageValue === "" && item.image && (
                        <p className="text-xs text-muted-foreground italic">
                          * Biarkan kosong untuk tetap menggunakan gambar lama
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok saat ini ({item.unit})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      inputMode="numeric"
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
                  <FormLabel>Batas stok minimum ({item.unit})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            </div>
            <div className="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
