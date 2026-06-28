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
      ? "Add supplies before creating recipes."
      : hasDuplicateSupplies
        ? "Each supply should only appear once in a recipe."
        : items.some((item) => !item.supplyId || Number(item.quantityRequired) <= 0)
          ? "Each ingredient needs a supply and a quantity greater than 0."
          : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recipe - {menuItem?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set how much of each supply is consumed every time this menu item is sold, using the supply base unit.
          </p>

          <Separator />

          {items.map((item, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_96px] gap-2 items-center">
                <Select value={item.supplyId} onValueChange={(value) => updateItem(index, { supplyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
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
                  placeholder={
                    supplies.find((supply) => String(supply.id) === item.supplyId)?.unit
                      ? `Qty per sale (${supplies.find((supply) => String(supply.id) === item.supplyId)?.unit})`
                      : "Qty per sale"
                  }
                  value={item.quantityRequired}
                  onChange={(e) => updateItem(index, { quantityRequired: e.target.value })}
                />

                <Button
                  variant="outline"
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  Remove
                </Button>
              </div>

              {item.supplyId && (() => {
                const selectedSupply = supplies.find((supply) => String(supply.id) === item.supplyId);
                if (!selectedSupply) return null;

                return (
                  <div className="text-sm text-muted-foreground">
                    Available now: <span className="font-medium text-foreground">{selectedSupply.stockQuantity} {selectedSupply.unit}</span>
                    {selectedSupply.stockQuantity <= selectedSupply.lowStockThreshold && (
                      <span className="ml-2 text-yellow-700">This ingredient is already low on stock.</span>
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
            Add Ingredient
          </Button>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isSubmitting || !!formError}
              onClick={() => onSubmit(items)}
            >
              Save Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}