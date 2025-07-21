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
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
      });
    }
  }, [item, form]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock - {item.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock ({item.unit})</FormLabel>
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
                  <FormLabel>Low Stock Alert Threshold ({item.unit})</FormLabel>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
