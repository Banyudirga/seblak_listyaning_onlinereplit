import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseForm, RecipeCoverageSummary, RecipeDraft, SupplyForm } from "@/components/supplies/supplies-types";
import type { MenuItem, MenuItemRecipe, Supply, SupplyPurchase, SupplyStockMovement } from "@shared/schema";

type UseSuppliesPageOptions = {
  editingMenuItem: MenuItem | null;
  supplySearch: string;
  recipeSearch: string;
  onAddSupplySuccess: () => void;
  onAddPurchaseSuccess: () => void;
  onRecipeSaveSuccess: () => void;
};

export function useSuppliesPage({
  editingMenuItem,
  supplySearch,
  recipeSearch,
  onAddSupplySuccess,
  onAddPurchaseSuccess,
  onRecipeSaveSuccess,
}: UseSuppliesPageOptions) {
  const { toast } = useToast();

  const { data: supplies = [], isLoading: suppliesLoading } = useQuery<Supply[]>({
    queryKey: ["/api/admin/supplies"],
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<SupplyPurchase[]>({
    queryKey: ["/api/admin/supply-purchases"],
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: recipeCoverage = [] } = useQuery<RecipeCoverageSummary[]>({
    queryKey: ["/api/admin/recipes/summary"],
  });

  const { data: stockMovements = [] } = useQuery<SupplyStockMovement[]>({
    queryKey: ["/api/admin/stock-movements"],
  });

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<MenuItemRecipe[]>({
    queryKey: [editingMenuItem ? `/api/admin/menu-items/${editingMenuItem.id}/recipes` : "/api/admin/menu-items/0/recipes"],
    enabled: !!editingMenuItem,
  });

  const supplyNameById = useMemo(
    () => Object.fromEntries(supplies.map((supply) => [supply.id, supply.name])) as Record<number, string>,
    [supplies]
  );

  const recipeCoverageByMenuItem = useMemo(
    () => Object.fromEntries(recipeCoverage.map((item) => [item.menuItemId, item.ingredientCount])) as Record<number, number>,
    [recipeCoverage]
  );

  const supplyById = useMemo(
    () => Object.fromEntries(supplies.map((supply) => [supply.id, supply])) as Record<number, Supply>,
    [supplies]
  );

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supply-purchases"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-movements"] }),
    ]);

    toast({
      title: "Refreshed",
      description: "Supply data has been refreshed.",
    });
  };

  const addSupplyMutation = useMutation({
    mutationFn: async (form: SupplyForm) =>
      apiRequest("POST", "/api/admin/supplies", {
        name: form.name,
        imageUrl: form.imageUrl.trim() || undefined,
        unit: form.unit,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        supplierName: form.supplierName || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] });
      onAddSupplySuccess();
      toast({
        title: "Supply added",
        description: "New supply item has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add supply.",
        variant: "destructive",
      });
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: async (form: PurchaseForm) =>
      apiRequest("POST", "/api/admin/supply-purchases", {
        supplyId: Number(form.supplyId),
        quantity: Number(form.quantity),
        purchaseUnit: form.purchaseUnit,
        baseUnitsPerPurchaseUnit: Number(form.baseUnitsPerPurchaseUnit),
        unitCost: Number(form.unitCost),
        supplierName: form.supplierName || null,
        notes: form.notes || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/supply-purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-movements"] }),
      ]);
      onAddPurchaseSuccess();
      toast({
        title: "Purchase recorded",
        description: "Supply stock has been increased.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record purchase.",
        variant: "destructive",
      });
    },
  });

  const lowStockSupplies = supplies.filter((supply) => supply.stockQuantity <= supply.lowStockThreshold);
  const totalPurchaseValue = purchases.reduce((sum, item) => sum + item.totalCost, 0);
  const filteredSupplies = supplies.filter((supply) =>
    `${supply.name} ${supply.supplierName ?? ""} ${supply.unit}`.toLowerCase().includes(supplySearch.toLowerCase())
  );
  const filteredMenuItems = menuItems.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(recipeSearch.toLowerCase())
  );
  const totalSupplyUnits = supplies.reduce((sum, supply) => sum + supply.stockQuantity, 0);
  const recentPurchases = purchases.slice(0, 5);
  const isPageLoading = suppliesLoading || purchasesLoading || menuItemsLoading;

  const saveRecipeMutation = useMutation({
    mutationFn: async ({ menuItemId, items }: { menuItemId: number; items: RecipeDraft[] }) =>
      apiRequest(
        "PUT",
        `/api/admin/menu-items/${menuItemId}/recipes`,
        items.map((item) => ({
          supplyId: Number(item.supplyId),
          quantityRequired: Number(item.quantityRequired),
        }))
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/recipes/summary"] });

      if (editingMenuItem) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/admin/menu-items/${editingMenuItem.id}/recipes`],
        });
      }

      onRecipeSaveSuccess();
      toast({
        title: "Recipe saved",
        description: "Recipe is ready for stock deduction on sales.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save recipe.",
        variant: "destructive",
      });
    },
  });

  return {
    supplies,
    purchases,
    menuItems,
    stockMovements,
    recipes,
    recipesLoading,
    suppliesLoading,
    purchasesLoading,
    menuItemsLoading,
    isPageLoading,
    lowStockSupplies,
    totalPurchaseValue,
    filteredSupplies,
    filteredMenuItems,
    totalSupplyUnits,
    recentPurchases,
    supplyNameById,
    recipeCoverageByMenuItem,
    supplyById,
    refreshAll,
    addSupplyMutation,
    addPurchaseMutation,
    saveRecipeMutation,
  };
}