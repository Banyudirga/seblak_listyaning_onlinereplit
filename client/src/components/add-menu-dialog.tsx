import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MenuItem } from "@shared/schema";
import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

const addMenuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: z.instanceof(File).or(z.string().min(1, "Image is required")),
  spicyLevel: z.string().optional(),
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().min(1, "Threshold must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  isAvailable: z.number().min(0).max(1),
});

export type AddMenuForm = z.infer<typeof addMenuSchema>;

interface AddMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddMenuForm) => void;
  isSubmitting: boolean;
}

export default function AddMenuDialog({ isOpen, onClose, onSubmit, isSubmitting }: AddMenuDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fetch menu items to get categories
  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
    enabled: isOpen, // Only fetch when dialog is open
  });
  
  // Extract unique categories from menu items
  const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
  
  const form = useForm<AddMenuForm>({
    resolver: zodResolver(addMenuSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
      spicyLevel: "none",
      stockQuantity: 50,
      lowStockThreshold: 10,
      unit: "porsi",
      isAvailable: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setImagePreview(null);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Menu item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Menu item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Rp)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Price in Rupiah" 
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Use predefined categories from menu-section.tsx */}
                      <SelectItem value="seblak">Seblak</SelectItem>
                      <SelectItem value="prasmanan">Seblak Prasmanan</SelectItem>
                      <SelectItem value="makanan">Makanan</SelectItem>
                      <SelectItem value="minuman">Minuman</SelectItem>
                      <SelectItem value="cemilan">Cemilan</SelectItem>
                      {/* Add any unique categories from existing menu items that aren't in the predefined list */}
                      {uniqueCategories
                        .filter(cat => !['seblak', 'prasmanan', 'makanan', 'minuman', 'cemilan'].includes(cat))
                        .map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                            // Create preview URL
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setImagePreview(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        {...fieldProps}
                      />
                      {imagePreview && (
                        <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden border border-input">
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${imagePreview})` }}
                          />
                        </div>
                      )}
                      {!imagePreview && (
                        <div className="flex items-center justify-center w-full h-32 mt-2 rounded-md border border-dashed border-input bg-muted/20">
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Image className="w-8 h-8 mb-2" />
                            <span>No image selected</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="spicyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spicy Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select spicy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="extra-hot">Extra Hot</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
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
                    <FormLabel>Low Stock Alert</FormLabel>
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
            </div>
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="porsi">Porsi</SelectItem>
                      <SelectItem value="gelas">Gelas</SelectItem>
                      <SelectItem value="pcs">Pcs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Available</SelectItem>
                      <SelectItem value="0">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
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
                disabled={isSubmitting}
                className="flex-1"
              >
                Add Menu Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}