import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MenuItem } from "@shared/schema";
import { useEffect } from "react";

const updateStockSchema = z.object({
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().min(1, "Threshold must be at least 1"),
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
  const form = useForm<UpdateStockForm>({
    resolver: zodResolver(updateStockSchema),
  });

  useEffect(() => {
    if (item) {
      form.reset({
        stockQuantity: item.stockQuantity ?? 0,
        lowStockThreshold: item.lowStockThreshold ?? 1,
      });
    }
  }, [item, form]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-lg translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:max-h-[90vh] sm:w-full sm:translate-y-[-50%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>Update Stock - {item.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock ({item.unit})</FormLabel>
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
                  <FormLabel>Low Stock Alert Threshold ({item.unit})</FormLabel>
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
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Update Stock
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
