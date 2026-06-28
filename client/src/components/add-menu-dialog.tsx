import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MenuItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  const imageValue = form.watch("image");
  const selectedFileName = imageValue instanceof File ? imageValue.name : "Belum ada file dipilih";

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setImagePreview(null);
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (imageValue instanceof File) {
      const objectUrl = URL.createObjectURL(imageValue);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof imageValue === "string") {
      setImagePreview(imageValue.trim() || null);
      return;
    }

    setImagePreview(null);
  }, [imageValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:max-h-[90vh] sm:w-full sm:translate-y-[-50%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
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
                  <FormLabel htmlFor="menu-image-file">Upload gambar atau isikan link gambar menu</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        id="menu-image-file"
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
                          htmlFor="menu-image-file"
                          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {value instanceof File ? "Ganti file" : "Pilih file"}
                        </label>
                        <Input
                          id="menu-image-url"
                          className="rounded-l-none"
                          placeholder="https://contoh.com/gambar-menu.jpg"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => onChange(e.target.value)}
                        />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{selectedFileName}</p>
                      {imagePreview && (
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="mb-2 text-xs text-muted-foreground">Preview gambar</p>
                          <img src={imagePreview} alt="Preview menu" className="h-32 w-full rounded-md bg-muted object-cover" />
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
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Add Menu Item
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
