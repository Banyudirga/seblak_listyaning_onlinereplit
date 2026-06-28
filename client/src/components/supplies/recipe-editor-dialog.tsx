import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

import { type RecipeDraft } from "@/components/supplies/supplies-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { MenuItem, MenuItemRecipe, Supply } from "@shared/schema";

type RecipeEditorDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (items: RecipeDraft[]) => void;
  isSubmitting: boolean;
  menuItem: MenuItem | null;
  supplies: Supply[];
  recipes: MenuItemRecipe[];
};

export function RecipeEditorDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  menuItem,
  supplies,
  recipes,
}: RecipeEditorDialogProps) {
  const [items, setItems] = useState<RecipeDraft[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(
      recipes.length > 0
        ? recipes.map((recipe) => ({
            supplyId: String(recipe.supplyId),
            quantityRequired: String(recipe.quantityRequired),
          }))
        : [{ supplyId: supplies[0] ? String(supplies[0].id) : "", quantityRequired: "1" }]
    );
  }, [open, recipes, supplies]);

  const updateItem = (index: number, next: Partial<RecipeDraft>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  const selectedSupplyIds = items.map((item) => item.supplyId).filter(Boolean);
  const hasDuplicateSupplies = new Set(selectedSupplyIds).size !== selectedSupplyIds.length;
  const formError =
    supplies.length === 0
      ? "Tambahkan barang terlebih dahulu sebelum membuat resep."
      : hasDuplicateSupplies
        ? "Setiap barang hanya boleh muncul satu kali dalam resep."
        : items.some((item) => !item.supplyId || Number(item.quantityRequired) <= 0)
          ? "Setiap bahan harus memiliki barang dan jumlah lebih dari 0."
          : null;

  const handleSubmit = () => {
    if (isSubmitting || formError) return;
    onSubmit(items);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:max-h-[90vh] sm:w-full sm:translate-y-[-50%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>Resep - {menuItem?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Tentukan berapa banyak setiap barang yang terpakai setiap kali menu ini terjual, menggunakan satuan dasar barang.
          </p>

          <Separator />

          {items.map((item, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_96px] gap-2 items-center">
                <Select value={item.supplyId} onValueChange={(value) => updateItem(index, { supplyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bahan" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.map((supply) => (
                      <SelectItem key={supply.id} value={String(supply.id)}>
                        {supply.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={
                    supplies.find((supply) => String(supply.id) === item.supplyId)?.unit
                      ? `Jumlah per penjualan (${supplies.find((supply) => String(supply.id) === item.supplyId)?.unit})`
                      : "Jumlah per penjualan"
                  }
                  value={item.quantityRequired}
                  onChange={(e) => updateItem(index, { quantityRequired: e.target.value })}
                />

                <Button
                  variant="outline"
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  Hapus
                </Button>
              </div>

              {item.supplyId && (() => {
                const selectedSupply = supplies.find((supply) => String(supply.id) === item.supplyId);
                if (!selectedSupply) return null;

                return (
                  <div className="text-sm text-muted-foreground">
                    Stok tersedia saat ini: <span className="font-medium text-foreground">{selectedSupply.stockQuantity} {selectedSupply.unit}</span>
                    {selectedSupply.stockQuantity <= selectedSupply.lowStockThreshold && (
                      <span className="ml-2 text-yellow-700">Bahan ini sudah berada di batas stok minimum.</span>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}

          <Button
            variant="outline"
            disabled={supplies.length === 0}
            onClick={() =>
              setItems((current) => [
                ...current,
                { supplyId: supplies[0] ? String(supplies[0].id) : "", quantityRequired: "1" },
              ])
            }
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah bahan
          </Button>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <div className="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isSubmitting || !!formError}
                onClick={handleSubmit}
              >
                Simpan resep
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
